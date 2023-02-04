//@ts-check

import { requestGPIOAccess } from "node-web-gpio";
import { requestI2CAccess } from "node-web-i2c";

/**
 * @typedef {import("node-web-gpio").GPIOPort} GPIOPort
 */

/**
 * @param {number} key
 * @returns {Promise<import("node-web-i2c").I2CPort>}
 */
export async function getI2CPort(key = 1) {
    const i2cAccess = await requestI2CAccess();
    const port = i2cAccess.ports.get(key);
    if (!port) throw new Error("I2Cポートへのアクセスが取得できません");
    console.log(port)
    return port;
}

/**
 * @param {number} n
 * @returns {Promise<GPIOPort>}
 */
export async function getGPIOPort(n) {
    const gpioAccess = await requestGPIOAccess();

    const gpioPort = gpioAccess.ports.get(n);
    if (!gpioPort) throw new Error(`GPIOポート ${n} の取得に失敗`);
    await gpioPort.export("in");
    return gpioPort
}