// @ts-check

import { execSync } from 'child_process';
import dotenv from "dotenv";

/**
 * @typedef {0 | 1 | 2 | 3 | 4} Note
 * @typedef {0 | 1 | 2 | 3} DrumPattern
 * @typedef {"C" | "Dm" | "F" | "G7"} PlaylistPreset
 * 
 * @typedef {{
 *  bt_address: string,
 *  notes: [Note, Note, Note, Note],
 *  drum_pattern: DrumPattern,
 *  playlist_preset: PlaylistPreset,
 * }} ControllerData
 */

/** @type {ControllerData} */
export let controller;

/** @type {number|undefined} */
export let order;

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(res => setTimeout(res, ms))
}

export async function initCommon() {
  dotenv.config();

  if (process.env["USER"] !== "root") {
    throw new Error(`rootユーザーとして起動してください`);
  }

  console.log(`初期化: グローバル変数`);

  const playlistPreset = process.env['PLAYLIST_PRESET'];
  if (!playlistPreset || !["C", "Dm", "F", "G7"].includes(playlistPreset ?? "")) {
    throw new Error(`PLAYLIST_PRESETの値が不正です: ${playlistPreset}`);
  }
  controller = {
    bt_address: getBtAddress(),
    notes: [0, 0, 0, 0],
    drum_pattern: 0,
    // @ts-ignore
    playlist_preset: playlistPreset,
  };
}

/**
 * その端末のBluetoothアドレスを取得する
 * 
 * @returns {string}
 */
function getBtAddress() {
  const pattern = /[0-9A-F][0-9A-F](?::[0-9A-F][0-9A-F]){3}/;
  const address = execSync('hciconfig').toString().match(pattern)?.[0]
  if (!address) throw new Error("Bluetoothアドレスを取得できません");
  return address
}

/** @param {number|undefined} newOrder */
export function setOrder(newOrder) {
  order = newOrder;
}