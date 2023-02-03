//@ts-check

import { controller, initCommon, order, setOrder, sleep } from "./modules/common.js";
import { becomeChildren, becomeParent, getChildCommand, getChildren, initBluetooth, notifyOrder } from "./modules/bluetooth.js";
import { buttonPressed, initGPIOButton } from "./modules/gpio/button.js";
import { initWebsocket, sendRequest } from "./modules/websocket.js";
import { initLed, setDisplayMode } from "./modules/gpio/led.js";

/**
 * @typedef {import("./modules/common").ControllerData} ControllerData
 */

async function main() {
    await init();
    await becomeChildren(); // みんな最初はこども

    while (true) {
        await buttonPressed();
        await becomeParent();

        // TODO: 動作確認としてだけ
        setDisplayMode("order");
        setOrder(((order ?? 0) + 1) % 4)

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
    await Promise.all([
        initLed(),
        initCommon(),
        initGPIOButton(),
        initWebsocket(),
        initBluetooth(),
    ]);
    console.log("初期化が完了")
}

main();