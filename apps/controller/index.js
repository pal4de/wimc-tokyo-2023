//@ts-check

import { controller, initCommon, sleep } from "./modules/common.js";
import { becomeChildren, becomeParent, getChildCommand, getChildren, initBluetooth, notifyOrder } from "./modules/bluetooth.js";
import { buttonEventEmitter, initButton, watchButton } from "./modules/gpio/button.js";
import { initWebsocket, sendRequest } from "./modules/websocket.js";
import { startDistanceSensor } from "./modules/gpio/distanseSpeaker.js";
import { initGPIO } from "./modules/gpio/index.js";
import { startDirectionSensor } from "./modules/gpio/direction.js";

/**
 * @typedef {import("./modules/common").ControllerData} ControllerData
 */

async function main() {
    await init();
    await becomeChildren(); // みんな最初はこども

    buttonEventEmitter.on('pressedLong', async () => {
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
    })

    buttonEventEmitter.on('pressedShort', () => {
        console.debug(controller);
    })
}

/** 初期化 */
async function init() {
    await initGPIO();

    await Promise.all([
        initCommon(),
        initButton(),
        initWebsocket(),
        initBluetooth(),
    ]);

    watchButton();
    startDistanceSensor();
    startDirectionSensor();

    console.log("初期化が完了");
}

main();