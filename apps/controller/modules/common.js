// @ts-check

import * as uuid from 'uuid';

/**
 * @typedef {{
 *  id: string,
 *  value: number,
 * }} CommandData
 * 
 * @typedef {{
 *  address: string,
 *  command: CommandData["id"],
 *  value: CommandData["value"],
 *  strength: number,
 * }} ControllerData
 */

/** @type {string} */
export let address;

/** @type {CommandData} */
export let command;

/** @type {number|undefined} */
export let order;

export async function initCommon() {
  if (process.env["USER"] !== "root") {
    throw new Error(`rootユーザーとして起動してください`);
  }

  console.log(`初期化: グローバル変数`);
  process.env["NOBLE_MULTI_ROLE"] = "1";
  address = uuid.v4(); // TODO: BTアドレスを入れる
  command = { // TODO: 適当な値に
    id: "hoge",
    value: 925
  };
  console.dir({ address, command });
}

/** 
 * 自分自身の操作情報を取得
 * 
 * @returns {ControllerData}
 */
export function getOwnCommand() {
  return {
    address: address,
    command: command.id,
    value: command.value,
    strength: Infinity,
  };
}

/** @param {number|undefined} newOrder */
export function setOrder(newOrder) {
  order = newOrder;
}