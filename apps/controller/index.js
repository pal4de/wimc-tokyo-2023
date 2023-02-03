//@ts-check

import { controller, initCommon, sleep } from "./modules/common.js";
import { becomeChildren, becomeParent, getChildCommand, getChildren, initBluetooth, notifyOrder } from "./modules/bluetooth.js";
import { buttonPressed, initGPIO } from "./modules/gpio.js";
import { initWebsocket, sendRequest } from "./modules/websocket.js";

/**
 * @typedef {import("./modules/common").ControllerData} ControllerData
 */

async function main() {
    await init();
    await becomeChildren(); // みんな最初はこども

    while (true) {
        await buttonPressed();
        await becomeParent();

        await sleep(3000);
        const children = await getChildren();
        await notifyOrder(children);

        const childrenCommandsPms = children
            .map(async (node) => await getChildCommand(node))
        const childrenCommands = await Promise.all(childrenCommandsPms);

        console.log("コマンド: ", childrenCommands);

        sendRequest([
            controller,
            ...childrenCommands
        ]);

        await becomeChildren();
    }
}

/** 初期化 */
async function init() {
    await Promise.all([
        initCommon(),
        initGPIO(),
        initWebsocket(),
        initBluetooth(),
    ]);
    console.log("初期化が完了")
}

main();