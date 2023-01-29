// @ts-check

import * as uuid from "uuid";
import nodeWebSocketLib from "websocket";
import { RelayServer } from "../lib/RelayServer";

/**
 * @typedef {{
 *  readonly serverName: string,
 *  onmessage: (message: string) => any,
 *  send(data: any): void
 * }} Channel
 */

/** @type {Channel} */
let remoteChannel;

export async function initWebsocket() {
    console.log(`初期化: リレーサーバー`);
    const RelayServiceName = `chirimentest`;
    const relay = RelayServer(RelayServiceName, `chirimenSocket`, nodeWebSocketLib, `https://chirimen.org`);
    if (relay) {
        remoteChannel = await relay.subscribe();
    } else {
        throw new Error(`リレーサーバーとの接続の初期化に失敗`)
    }
}

/**
 * リレーサーバーにリクエストを送る
 * 
 * @param {import("../common").ControllerData[]} commands 
 */
export function sendRequest(commands) {
    const requestId = uuid.v4();
    const request = { requestId, commands };
    remoteChannel.send(JSON.stringify(request));
    console.log(`Sent: ${JSON.stringify(request)}`);
}