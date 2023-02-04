//@ts-check

import { requestGPIOAccess } from "node-web-gpio";

/**
 * @typedef {"long" | "short"} ButtonPressType
 */

const threshold = 700;

/** @type {import("node-web-gpio").GPIOPort} */
let gpioPort;

/** @type {number} */
let pressedDownTime;

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
 * @returns {Promise<ButtonPressType>}
 */
export function buttonPressed() {
    return new Promise(resolve => {
        gpioPort.onchange = ({ value }) => {
            if (value == 0) {
                console.log("ボタン: 押下");
                pressedDownTime = new Date().getTime();
            } else {
                const pressedTime = new Date().getTime() - pressedDownTime;
                if (isNaN(pressedTime)) return;

                console.log(`ボタン: 解放 (${pressedTime}ms)`);
                if (pressedTime < threshold) {
                    resolve("short");
                } else {
                    resolve("long");
                }
                delete gpioPort.onchange;
            }
        }
    })
}