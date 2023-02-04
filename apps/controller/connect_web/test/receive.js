import nodeWebSocketLib from "websocket"; // https://www.npmjs.com/package/websocket
import { musicPlay } from "../../../player/index.js";
import { RelayServer } from "../../lib/RelayServer.js";

let channel;

async function connect() {
	// webSocketリレーの初期化
	var relay = RelayServer("chirimentest", "chirimenSocket", nodeWebSocketLib, "https://chirimen.org");
	channel = await relay.subscribe("playerCourage");
	console.log("web socketリレーサービスに接続しました");
	channel.onmessage = displayResult;
}

function displayResult({ data }) {
	try {
		musicPlay(data.controllers);
	} catch (e) {
		console.log("音楽再生でエラーが発生しました", e)	
	}
}

connect();
