//@ts-check

import { requestGPIOAccess } from "node-web-gpio";

/** @type {import("node-web-gpio").GPIOPort} */
let gpioPort;

export async function initGPIO() {
    console.log(`初期化: GIPO`);
    const GPIOPortNum = 5;
    const gpioAccess = await requestGPIOAccess();
    const gpioPortOrUndefined = gpioAccess.ports.get(GPIOPortNum);
    if (gpioPortOrUndefined) {
        gpioPort = gpioPortOrUndefined;
        await gpioPort.export("in");
    } else {
        throw new Error(`GPIOポート ${GPIOPortNum} の取得に失敗`);
    }
}

/**
 * ボタンが押されるまで待つ
 * 
 * @returns {Promise<void>}
 */
export function buttonPressed() {
    return new Promise(resolve => {
        gpioPort.onchange = ({ value }) => {
            if (value == 0) {
                console.log("ボタン: 押下")
            } else {
                console.log("ボタン: 解放")
                resolve();
                delete gpioPort.onchange;
            }
        }
    })
}
