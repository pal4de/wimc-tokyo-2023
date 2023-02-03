//@ts-check

import { requestGPIOAccess } from "node-web-gpio";

/** @type {import("node-web-gpio").GPIOPort} */
let gpioPort;

export async function initGPIOButton() {
    console.log(`初期化: タクトスイッチ`);
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
 * タクトスイッチが押されるまで待つ
 * 
 * @returns {Promise<void>}
 */
export function buttonPressed() {
    return new Promise(resolve => {
        gpioPort.onchange = ({ value }) => {
            if (value == 0) {
                console.log("タクトスイッチ: 押下")
            } else {
                console.log("タクトスイッチ: 解放")
                resolve();
                delete gpioPort.onchange;
            }
        }
    })
}
