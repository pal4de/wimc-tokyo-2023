//@ts-check

import bleno from "@abandonware/bleno";
import noble from "@abandonware/noble";
import * as uuid from 'uuid';
import os from "os";
import { ControllerNamePrefix, setIsParent } from ".";
import { command, setOrder } from "../../common";

/**
 * @typedef {noble.Peripheral} Child
 * @typedef {import("../../common").CommandData} CommandData
 * @typedef {import("../../common").ControllerData} ControllerData
 */

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