// Remote Example9 - reciever
// for CHIRIMEN with nodejs

// import {requestGPIOAccess} from "./node_modules/node-web-gpio/dist/index.js";
// const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
import nodeWebSocketLib from "websocket"; // https://www.npmjs.com/package/websocket
import {RelayServer} from "./RelayServer.js";

var channel;
var gpioPort0;
let msg;

async function connect(){
	// GPIOポート0の初期化
	// var gpioAccess = await requestGPIOAccess();
	// var mbGpioPorts = gpioAccess.ports;
	// gpioPort0 = mbGpioPorts.get(5);
	// await gpioPort0.export("in"); //port0 out

	// webSocketリレーの初期化
	var relay = RelayServer("chirimentest", "chirimenSocket" , nodeWebSocketLib, "https://chirimen.org");
	channel = await relay.subscribe("controllerCourage");
	console.log("web socketリレーサービスに接続しました");
	// gpioPort0.onchange=sendMessage; // ISSUE gpioのonchangeの仕様が異なる
  sendMessage("test");
}

function sendMessage(val){
  // if (val.value === 0) {
  msg = {
    "request_id": "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bcd",
    "controllers": [
      {
        "bt_address": "34-22-79-74-B1-92",
        "notes": [
          1,
          1,
          3,
          4
        ], // 0: 無音, 1: 低音, 2: 中低音, ...
        "drum_pattern": 1, // 1, 2: dramパターン
        "playlist_preset": "Dm" // "G7", "C", "Dm", "F": コントローラー固有のコード
      },
      {
        "bt_address": "15-EE-B4-96-8D-A9",
        "notes": [
          4,
          4,
          2,
          3
        ],
        "drum_pattern": 2,
        "playlist_preset": "F"
      },
      {
        "bt_address": "57-C5-D6-EC-12-17",
        "notes": [
          4,
          3,
          1,
          2
        ],
        "drum_pattern": 1,
        "playlist_preset": "C"
      },
      {
        "bt_address": "6E-C8-78-59-C6-75",
        "notes": [
          0,
          3,
          1,
          4
        ],
        "drum_pattern": 1,
        "playlist_preset": "F"
      }
    ]
  }
  console.log(msg);
  channel.send(msg);
  // }
}


connect();
