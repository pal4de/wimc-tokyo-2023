import nodeWebSocketLib from "websocket"; // https://www.npmjs.com/package/websocket
import {RelayServer} from "./RelayServer.js";

let channel;

async function connect(){
	// GPIOポート0の初期化
	// var gpioAccess = await requestGPIOAccess();
	// var mbGpioPorts = gpioAccess.ports;
	// gpioPort0 = mbGpioPorts.get(26);
	// await gpioPort0.export("out"); //port0 out

	// webSocketリレーの初期化
	var relay = RelayServer("chirimentest", "chirimenSocket" , nodeWebSocketLib, "https://chirimen.org");
	channel = await relay.subscribe("playerCourage");
	console.log("web socketリレーサービスに接続しました");
	channel.onmessage = displayResult;
}

function displayResult(messge){
	console.log(messge.data["スイッチ"]);
}

connect();
