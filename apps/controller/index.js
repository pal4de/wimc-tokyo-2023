//@ts-check

import { controller, initCommon, sleep } from "./modules/common.js";
import { becomeChildren, becomeParent, getChildCommand, getChildren, initBluetooth, notifyOrder } from "./modules/bluetooth.js";
import { buttonPressed, initButton } from "./modules/gpio/button.js";
import { initWebsocket, sendRequest } from "./modules/websocket.js";
import { initDistanceSensor, startDistanceSensor } from "./modules/gpio/distanseSpeaker.js";
import { initGPIO } from "./modules/gpio/index.js";

/**
 * @typedef {import("./modules/common").ControllerData} ControllerData
 */

async function main() {
    await init();
    await becomeChildren(); // みんな最初はこども

    while (true) {
        if (await buttonPressed() === "short") {
            // TODO: 音階の決定
            continue;
        };

        await becomeParent();

        await sleep(7000);
        const children = await getChildren();
        await notifyOrder(children);

        const childrenCommandsPms = children
            .map(async (node) => await getChildCommand(node))
        const childrenCommands = await Promise.all(childrenCommandsPms);

        console.log("コマンド:", childrenCommands);

        sendRequest([
            controller,
            ...childrenCommands
        ]);

        await becomeChildren();
    }
}

/** 初期化 */
async function init() {
    await initGPIO();

    await Promise.all([
        initCommon(),
        initButton(),
        initDistanceSensor(),
        initWebsocket(),
        initBluetooth(),
    ]);

    startDistanceSensor();
    // startDirectionSensor();

    console.log("初期化が完了");
}

main();