import { RelayServer } from "https://chirimen.org/remote-connection/js/beta/RelayServer.js";

window.SendMessage = sendMessage;

let channel_controller;
let channel_player;

onload = async function(){
	// webSocketリレーの初期化
	var relay = RelayServer("chirimentest", "chirimenSocket" );
	channel_controller = await relay.subscribe("controllerCourage");
	console.log("web socketリレーサービス(controller)に接続しました");
  channel_player = await relay.subscribe("playerCourage");
	console.log("web socketリレーサービス(player)に接続しました");
	channel_controller.onmessage = getMessage;
}

// メッセージを受信したときに起動する関数
function getMessage(msg){
	let mdata = msg.data;
	messageDiv.innerText = JSON.stringify(mdata["スイッチ"]);
  // messageDiv.innerText = mdata;
	console.log("mdata:", mdata);
}

// メッセージを送信するときに起動する関数
function sendMessage(){
	let mdata = {
    "スイッチ": "High",
    "データ": 0
  };
	// messageDiv.innerText = JSON.stringify(mdata["スイッチ"]);
  // messageDiv.innerText = mdata;
  channel_player.send(mdata);
	console.log("mdata:", mdata);
}
