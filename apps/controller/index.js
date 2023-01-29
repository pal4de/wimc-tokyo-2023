//@ts-check

import dotenv from "dotenv";
import { getOwnCommand, initCommon } from "./common";
import { becomeChildren, becomeParent, getChildCommand, getChildren, initBluetooth, notifyOrder } from "./modules/bluetooth";
import { buttonPressed, initGPIO } from "./modules/gpio";
import { initWebsocket, sendRequest } from "./modules/websocket";

/**
 * @typedef {import("./common").CommandData} CommandData
 * @typedef {import("./common").ControllerData} ControllerData
 */

async function main() {
    await init();
    await becomeChildren(); // みんな最初はこども

    while (true) {
        await buttonPressed();

        await becomeParent();
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
}

dotenv.config();
main();