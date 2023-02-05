//@ts-check

import bleno from "@abandonware/bleno";
import noble from "@abandonware/noble";
import os from "os";
import { controller, setOrder } from "./common.js";
import { setDisplayMode } from "./gpio/led.js";

/**
 * @typedef {noble.Peripheral} Child
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
const children = new Map();

/** @type {Map<string, number[]>} */
const rssiHistoryMap = new Map();

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

        await noble.stopScanningAsync();

        rssiHistoryMap.set(peripheral.id, []);
        const rssiHistoryIntervalId = setInterval(async () => {
            const rssi = await peripheral.updateRssiAsync();
            rssiHistoryMap.get(peripheral.id)?.push(rssi);
        }, 100);
        peripheral.once('disconnect', () => {
            clearInterval(rssiHistoryIntervalId);
            rssiHistoryMap.delete(peripheral.id);
        });

        children.set(peripheral.id, peripheral);
        console.log('子機と接続:', peripheral.id);
        peripheral.once('disconnect', () => {
            children.delete(peripheral.id);
            console.log('子機との接続が解除:', peripheral.id);
        });

        await peripheral.connectAsync();
        const services = await peripheral.discoverServicesAsync();
        const servicesPms = services.map(async service => {
            await service.discoverIncludedServicesAsync();
            await service.discoverCharacteristicsAsync();
        });
        await Promise.all(servicesPms);

        console.log("子機の準備が完了:", peripheral.id);

        noble.startScanningAsync();
    })
}

/** 親機になる */
export async function becomeParent() {
    if (!parentReady) throw new Error(`親機としての準備が完了していません`);

    console.log("親機になりました");
    setIsParent(true);
    setOrder(1);
    // ほかにも親機がいないかチェックしてもいいかも

    bleno.stopAdvertising();
    await noble.startScanningAsync();
}

/**
 * RSSI順でソート済みの子機を取得
 * 
 * @returns {Promise<Child[]>}
 */
export async function getChildren() {
    if (!isParent) throw new Error(`親機ではないため子機を取得できません`);
    noble.stopScanningAsync();
    const sorted = [...children.values()].sort((a, b) => -(calcAverageRssi(a) - calcAverageRssi(b)));
    console.log(sorted.map(child => calcAverageRssi(child)));
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
 * @returns {Promise<ControllerData>}
 */
export async function getChildCommand(child) {
    const characteristics = await getCharacteristics(child);

    const readCommandCh = characteristics.find(c => c.uuid === readControlCharacteristicId);
    if (!readCommandCh) throw new Error(`子機 ${child.address} から操作読取用キャラクタリスティックが見つかりません`);

    const controllerDataJson = (await readCommandCh.readAsync()).toString();
    console.debug(controllerDataJson);
    const controllerData = JSON.parse(controllerDataJson);

    return controllerData;
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

/** 
 * @param {Child} child
 * @returns {number}
 */
function calcAverageRssi(child) {
    const rssiHistory = rssiHistoryMap.get(child.id);
    if (!rssiHistory) throw new Error(`子機のRSSI履歴が取得できません: ${child.id}`)
    const sum = rssiHistory.reduce((a, b) => a + b);
    const average = sum / rssiHistory.length
    return average;
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
    bleno.on('accept', (address) => {
        setDisplayMode("loading");
        console.log(`子機が受容: ${address}`)
    });
    bleno.on('disconnect', (clientAddress) => {
        setDisplayMode("playlistPreset");
        console.log(`子機が切断: ${clientAddress}`)
    });

    process.on('SIGTERM', () => {
        bleno.stopAdvertising();
    })
}

/** 子機になる */
export async function becomeChildren() {
    if (!childReady) throw new Error(`子機としての準備が完了していません`);

    console.log("子機になりました");
    setIsParent(false);
    const disconnectPms = [...children.values()].map(child => child.disconnectAsync());
    await Promise.all(disconnectPms);

    bleno.startAdvertising(name, [serviceUuid]);
    console.log("アドバタイズを開始 サービスID:", serviceUuid);
}

/** 捜査情報の読み取り用Characteristic */
const readControlCharacteristic = new bleno.Characteristic({
    uuid: readControlCharacteristicId,
    properties: ["read"],
    onReadRequest: (offset, callback) => {
        console.log("読み取り: ", controller);
        callback(
            bleno.Characteristic.RESULT_SUCCESS,
            Buffer.from(JSON.stringify(controller))
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
            setDisplayMode("order")
            result = bleno.Characteristic.RESULT_SUCCESS;
        } else {
            console.error("順序の型が異常です");
            setOrder(undefined);
            result = bleno.Characteristic.RESULT_UNLIKELY_ERROR;
        }

        if (!withoutResponse) callback(result);
    }
})