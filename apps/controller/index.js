//@ts-check

import dotenv from "dotenv";
import { getOwnCommand, initCommon, sleep } from "./modules/common.js";
import { becomeChildren, becomeParent, getChildCommand, getChildren, initBluetooth, notifyOrder } from "./modules/bluetooth.js";
import { buttonPressed, initGPIO } from "./modules/gpio.js";
import { initWebsocket, sendRequest } from "./modules/websocket.js";

/**
 * @typedef {import("./modules/common").CommandData} CommandData
 * @typedef {import("./modules/common").ControllerData} ControllerData
 */

async function main() {
    await init();
    await becomeChildren(); // みんな最初はこども

    while (true) {
        await buttonPressed();

        await becomeParent();
        await sleep(5000);
        const children = await getChildren();
        notifyOrder(children);

        const childrenCommandsPms = children
            .map(async (node) => {
                const command = await getChildCommand(node);
                /** @type {ControllerData} */
                const controllerData = {
                    address: node.address,
                    command: command.id,
                    value: command.value,
                    strength: node.rssi,
                }
                return controllerData;
            })
        const childrenCommands = await Promise.all(childrenCommandsPms);

        sendRequest([
            getOwnCommand(),
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

dotenv.config();
main();