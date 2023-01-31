//@ts-check


import * as uuid from 'uuid';
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

export const ControllerNamePrefix = "COURAGE_CONTROLLER";
export const ControllerNamePattern = new RegExp(`^${ControllerNamePrefix}: `);

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

export async function initParent() {
    console.log(`初期化: 親機`);
    bleno.on('stateChange', state => {
        if (state === 'poweredOn') {
            parentReady = true;
        } else if (state === 'poweredOff') {
            parentReady = false;
        }
    });

    noble.on('discover', peripheral => {
        const name = peripheral.advertisement.localName;
        if (name.match(ControllerNamePattern)) {
            children.push(peripheral);
        }
    });
}

let parentReady = false;

/** @type {Child[]} */
let children = [];

/** 親機になる */
export async function becomeParent() {
    if (!parentReady) throw new Error(`親機としての準備が完了していません`);

    setIsParent(true);
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
    const promises = children.map(node => node.updateRssiAsync());
    await Promise.all(promises);
    const sorted = children.sort((a, b) => a.rssi - b.rssi);
    return sorted;
}

/**
 * 子機から操作情報を取得
 * 
 * @param {Child} child
 * @returns {Promise<CommandData>}
 */
export async function getChildCommand(child) {
    const { characteristics } = await child.discoverAllServicesAndCharacteristicsAsync();
    console.log(`Characteristics: %j`, characteristics);

    const readCommandCh = characteristics.find(c => c.name === CharacaristicName.ReadControl);
    if (!readCommandCh) throw new Error(`子機 ${child.address} から操作読取用Characteristicが見つかりません`);
    const controllerDataJson = (await readCommandCh.readAsync()).toString();
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
 * 子機に順番を通知
 * 
 * @param {Child[]} children
 */
export async function notifyOrder(children) {
    const promises = children.map(async (child, order) => {
        const { characteristics } = await child.discoverAllServicesAndCharacteristicsAsync();
        console.log(`Characteristics: %j`, characteristics);

        const orderCh = characteristics.find(c => c.name === CharacaristicName.Order);
        if (!orderCh) throw new Error(`子機 ${child.address} から順序用Characteristicが見つかりません`);
        await orderCh.writeAsync(Buffer.from(order.toString()), true);
    });
    await Promise.all(promises);
}


// // // // // child // // // // //

/** @type {string} */
let serviceUuid;

export const CharacaristicName = {
    ReadControl: "read-control",
    Order: "order",
};

let childReady = false;

const name = `${ControllerNamePrefix}: ${os.hostname()}`;

export async function initChild() {
    console.log(`初期化: 子機`);
    if (process.env[`SERVICE_UUID`]) {
        serviceUuid = process.env[`SERVICE_UUID`].replace(/-/g, "");
    } else {
        throw new Error(`.envで SERVICE_UUID を設定する必要があります`);
    }

    const primaryService = new bleno.PrimaryService({
        uuid: serviceUuid,
        characteristics: [
            readControlCharacteristic,
            orderCharacteristic,
        ]
    })
    bleno.setServices([primaryService]);

    bleno.on('stateChange', state => {
        if (state === 'poweredOn') {
            childReady = true;
        } else if (state === 'poweredOff') {
            childReady = false;
        }
    })

    bleno.on('advertisingStart', err => {
        if (err) throw err;
    })

}

/** 子機になる */
export async function becomeChildren() {
    if (!childReady) throw new Error(`子機としての準備が完了していません`);

    setIsParent(false);
    noble.stopScanningAsync();
    bleno.startAdvertising(name, [serviceUuid]);
}

/** 捜査情報の読み取り用Characteristic */
const readControlCharacteristic = new bleno.Characteristic({
    uuid: uuid.v4(),
    properties: ["read"],
    onReadRequest: (offset, callback) => {
        callback(
            bleno.Characteristic.RESULT_SUCCESS,
            Buffer.from(JSON.stringify(command))
        )
    }
})

const orderCharacteristic = new bleno.Characteristic({
    uuid: uuid.v4(),
    properties: ["write"],
    onWriteRequest: (data, offset, withoutResponse, callback) => {
        /** @type {number} */
        let result;

        const { order } = JSON.parse(data.toString());
        if (typeof order === "number") {
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