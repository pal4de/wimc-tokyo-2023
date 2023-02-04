//@ts-check

import { requestGPIOAccess } from "node-web-gpio";
import { requestI2CAccess } from "node-web-i2c";

/**
 * @typedef {import("node-web-gpio").GPIOPort} GPIOPort
 */

/** @type {import("node-web-gpio").GPIOAccess} */
let gpioAccess;

/** @type {import("node-web-i2c").I2CPort} */
export let i2cPort;

export async function initGPIO() {
    console.log(`初期化: GIPO`);
    gpioAccess = await requestGPIOAccess();

    const i2cAccess = await requestI2CAccess();
    const i2cPortUndefinedable = i2cAccess.ports.get(1);
    if (!i2cPortUndefinedable) throw new Error("I2Cポートへのアクセスが取得できません");
    i2cPort = i2cPortUndefinedable;
}

/** @type {Map<number, GPIOPort>} */
let portsCache = new Map();
/**
 * @param {number} n
 * @returns {Promise<GPIOPort>}
 */
export async function getGPIOPort(n) {
    const cache = portsCache.get(n)
    if (cache) return cache;

    const gpioPort = gpioAccess.ports.get(n);
    if (!gpioPort) throw new Error(`GPIOポート ${n} の取得に失敗`);
    await gpioPort.export("in");
    portsCache.set(n, gpioPort);
    return gpioPort
}