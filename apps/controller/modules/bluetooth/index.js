//@ts-check

import { becomeChildren, initChild } from "./child";
import { becomeParent, getChildCommand, getChildren, initParent, notifyOrder } from "./parent";

/**
 * @typedef {import("noble").Peripheral} Child
 * @typedef {import("../../common").CommandData} CommandData
 * @typedef {import("../../common").ControllerData} ControllerData
 */

/** @type {boolean} */
export let isParent = false;

export const ControllerNamePrefix = "COURAGE_CONTROLLER";
export const ControllerNamePattern = new RegExp(`^${ControllerNamePrefix}: `);

export async function initBluetooth() {
    await Promise.all([
        initParent(),
        initChild(),
    ])
}

/** @param {boolean} value */
export function setIsParent(value) {
    isParent = value;
}

export { becomeChildren, becomeParent, getChildCommand, getChildren, notifyOrder };

