import { RelayServer } from "https://chirimen.org/remote-connection/js/beta/RelayServer.js";

let channel_controller;

onload = async function(){
	// webSocketリレーの初期化
	var relay = RelayServer("chirimentest", "chirimenSocket" );
	channel_controller = await relay.subscribe("controllerYUKI");
	console.log("web socketリレーサービスに接続しました");
	channel_controller.onmessage = getMessage;
}

// メッセージを受信したときに起動する関数
function getMessage(msg){
	var mdata = msg.data;
	// messageDiv.innerText = JSON.stringify(mdata);
  messageDiv.innerText = mdata;
	console.log("mdata:",mdata);
}
