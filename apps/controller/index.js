//@ts-check

import { becomeChildren, becomeParent, getChildCommand, getChildren, initBluetooth, notifyOrder } from "./modules/bluetooth.js";
import { controller, initCommon, sleep } from "./modules/common.js";
import { buttonEventEmitter, initButton, watchButton } from "./modules/gpio/button.js";
import { initDirectionSensor, startDirectionSensor } from "./modules/gpio/direction.js";
import { initDistanceSensor, startDistanceSensor } from "./modules/gpio/distanseSpeaker.js";
import { initWebsocket, sendRequest } from "./modules/websocket.js";

/**
 * @typedef {import("./modules/common").ControllerData} ControllerData
 */

async function main() {
    await init();
    watchButton();
    startDistanceSensor();
    startDirectionSensor();

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
    await Promise.all([
        initCommon(),
        initButton(),
        initWebsocket(),
        initBluetooth(),
    ]);

    await initDistanceSensor();
    await initDirectionSensor();

    console.log("初期化が完了");
}

main();