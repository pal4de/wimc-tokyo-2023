//@ts-check

import { getGPIOPort } from "./index.js";

/**
 * @typedef {"long" | "short"} ButtonPressType
 */

const gpioPortNum = 5;
const threshold = 700;

/** @type {import("node-web-gpio").GPIOPort} */
export let buttonPort;

/** @type {number} */
let pressedDownTime;

export async function initButton() {
    buttonPort = await getGPIOPort(gpioPortNum);
}

/**
 * ボタンが押されるまで待つ
 * 
 * @returns {Promise<ButtonPressType>}
 */
export function buttonPressed() {
    return new Promise(resolve => {
        buttonPort.onchange = ({ value }) => {
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
                delete buttonPort.onchange;
            }
        }
    })
}