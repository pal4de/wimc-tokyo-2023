//@ts-check

import { command, setOrder } from "./common.js";
import bleno from "@abandonware/bleno";
import noble from "@abandonware/noble";
import os from "os";

/**
 * @typedef {noble.Peripheral} Child
 * @typedef {import("./common").CommandData} CommandData
 * @typedef {import("./common").ControllerData} ControllerData
 */

/** @type {boolean} */
export let isParent = false;

export const ControllerNamePrefix = "CRGCTRL";
export const ControllerNamePattern = new RegExp(`^${ControllerNamePrefix}:`);

const serviceUuid = 'fffffffffffffffffffffffffffffff0';
const readControlCharacteristicId = 'fffffffffffffffffffffffffffffff1';
const orderCharacteristicId = 'fffffffffffffffffffffffffffffff2';

export async function initBluetooth() {
    await Promise.all([
        initParent(),
        initChild(),
    ])
}

/** @param {boolean} value */
export function setIsParent(value) {
    isParent = value;
}

// // // // // parent // // // // //

let parentReady = false;

/** @type {Map<string, Child>} */
let children = new Map([]);

export async function initParent() {
    console.log(`初期化: 親機`);

    noble.on('stateChange', state => {
        if (state === 'poweredOn') {
            parentReady = true;
        } else if (state === 'poweredOff') {
            parentReady = false;
        }
    });

    noble.on('scanStart', () => console.log("スキャンを開始"));
    noble.on('scanStop', () => console.log("スキャンを停止"));

    noble.on('discover', async peripheral => {
        const name = peripheral.advertisement.localName;
        if (!name?.match(ControllerNamePattern)) return;

        children.set(peripheral.id, peripheral);
        console.log('子機と接続:', peripheral.id);
        peripheral.on('disconnect', () => {
            children.delete(peripheral.id);
            console.log('子機との接続が解除:', peripheral.id);
        });

        await peripheral.connectAsync();
        const services = await peripheral.discoverServicesAsync();
        services.map(async service => {
            await service.discoverIncludedServicesAsync();
            await service.discoverCharacteristicsAsync();
        })
    })
}

/** 親機になる */
export async function becomeParent() {
    if (!parentReady) throw new Error(`親機としての準備が完了していません`);

    console.log("親機になりました");
    setIsParent(true);
    // ほかにも親機がいないかチェックしてもいいかも

    bleno.stopAdvertising();
    noble.startScanning([], false);
}

/**
 * RSSI順でソート済みの子機を取得
 * 
 * @returns {Promise<Child[]>}
 */
export async function getChildren() {
    if (!isParent) throw new Error(`親機ではないため子機を取得できません`);
    const childrenArr = [...children.values()];
    const promises = childrenArr.map(node => node.updateRssiAsync());
    await Promise.all(promises);
    const sorted = childrenArr.sort((a, b) => a.rssi - b.rssi);
    return sorted;
}

/**
 * 子機に順番を通知
 * 
 * @param {Child[]} children
 * @returns {Promise<void>}
 */
export async function notifyOrder(children) {
    const promises = children.map(async (child, i) => {
        const order = i + 2;
        const characteristics = await getCharacteristics(child);

        const orderCh = characteristics.find(c => c.uuid === orderCharacteristicId);
        if (!orderCh) throw new Error(`子機 ${child.address} から順序用キャラクタリスティックが見つかりません`);

        const message = JSON.stringify({ order });
        console.log("通知:", message);
        await orderCh.writeAsync(Buffer.from(message), false);
    });
    await Promise.all(promises);
}

/**
 * 子機から操作情報を取得
 * 
 * @param {Child} child
 * @returns {Promise<CommandData>}
 */
export async function getChildCommand(child) {
    const characteristics = await getCharacteristics(child);

    const readCommandCh = characteristics.find(c => c.uuid === readControlCharacteristicId);
    if (!readCommandCh) throw new Error(`子機 ${child.address} から操作読取用キャラクタリスティックが見つかりません`);

    const controllerDataJson = (await readCommandCh.readAsync()).toString();
    console.debug(controllerDataJson);
    const controllerData = JSON.parse(controllerDataJson);

    const id = controllerData['id'];
    if (!id) throw new Error(`子機 ${child.address} からの操作IDがありません`);
    if (typeof id !== 'string') throw new Error(`子機 ${child.address} の操作IDの型が不正です (${typeof id})`);

    const value = controllerData['value'];
    if (!value) throw new Error(`子機 ${child.address} からの値がありません`);
    if (typeof value !== 'number') throw new Error(`子機 ${child.address} の値の型が不正です (${typeof id})`);

    return { id, value };
}

/**
 * @param {noble.Peripheral} peripheral 
 * @returns {Promise<noble.Characteristic[]>}
 */
async function getCharacteristics(peripheral) {
    const characteristics = peripheral.services
        .filter(service => !(service.name?.match(/^Generic (Access|Attribute)$/) ?? false))
        .flatMap(service => {
            return service.characteristics
        })
    return characteristics;
}

// // // // // child // // // // //

let childReady = false;

const name = `${ControllerNamePrefix}:${os.hostname()}`;

export async function initChild() {
    console.log(`初期化: 子機`);

    const primaryService = new bleno.PrimaryService({
        uuid: serviceUuid,
        characteristics: [
            readControlCharacteristic,
            orderCharacteristic,
        ]
    });
    bleno.setServices([primaryService]);

    bleno.on('stateChange', state => {
        if (state === 'poweredOn') {
            childReady = true;
        } else if (state === 'poweredOff') {
            childReady = false;
        }
    });

    bleno.on('advertisingStart', err => { if (err) throw err; });
    bleno.on('accept', (address) => console.log(`子機が受容: ${address}`));
    bleno.on('disconnect', (clientAddress) => console.log(`子機が切断: ${clientAddress}`));

    process.on('SIGTERM', () => {
        bleno.stopAdvertising();
    })
}

/** 子機になる */
export async function becomeChildren() {
    if (!childReady) throw new Error(`子機としての準備が完了していません`);

    console.log("子機になりました");
    setIsParent(false);
    noble.stopScanningAsync();
    children.forEach(child => child.disconnect());

    bleno.startAdvertising(name, [serviceUuid]);
    console.log("アドバタイズを開始 サービスID:", serviceUuid);
}

/** 捜査情報の読み取り用Characteristic */
const readControlCharacteristic = new bleno.Characteristic({
    uuid: readControlCharacteristicId,
    properties: ["read"],
    onReadRequest: (offset, callback) => {
        console.log("読み取り: ", command);
        callback(
            bleno.Characteristic.RESULT_SUCCESS,
            Buffer.from(JSON.stringify(command))
        )
    }
})

/** 順序通知用Characteristic */
const orderCharacteristic = new bleno.Characteristic({
    uuid: orderCharacteristicId,
    properties: ["write"],
    onWriteRequest: (data, offset, withoutResponse, callback) => {
        /** @type {number} */
        let result;

        const { order } = JSON.parse(data.toString());
        if (typeof order === "number") {
            console.log("順序: ", order);
            setOrder(order);
            result = bleno.Characteristic.RESULT_SUCCESS;
        } else {
            console.error("順序の型が異常です");
            setOrder(undefined);
            result = bleno.Characteristic.RESULT_UNLIKELY_ERROR;
        }

        if (!withoutResponse) callback(result);
    }
})