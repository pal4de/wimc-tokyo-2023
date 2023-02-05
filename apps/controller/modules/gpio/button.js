//@ts-check

import { getGPIOPort } from "./index.js";
import { EventEmitter } from 'events';

/**
 * @typedef {"long" | "short"} ButtonPressType
 */

const gpioPortNum = 4;
const threshold = 700;

/** @type {import("node-web-gpio").GPIOPort} */
export let buttonPort;

/** @type {number} */
let pressedDownTime;

export async function initButton() {
    buttonPort = await getGPIOPort(gpioPortNum);
}

/** @type {EventEmitter} */
export const buttonEventEmitter = new EventEmitter();

export async function watchButton() {
    while (true) {
        switch (await buttonPressed()) {
            case "long": {
                buttonEventEmitter.emit("pressedLong");
                buttonEventEmitter.emit("pressed", "long");
                break
            }
            case "short": {
                buttonEventEmitter.emit("pressedShort");
                buttonEventEmitter.emit("pressed", "short");
                break
            }
        }
    }
}

/**
 * ボタンが押されるまで待つ
 * 
 * @returns {Promise<ButtonPressType>}
 */
function buttonPressed() {
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
