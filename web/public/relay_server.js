import { RelayServer } from "https://chirimen.org/remote-connection/js/beta/RelayServer.js";

window.TestSendMessage = testSendMessage;
window.DisplayDetail = displayDetail;
window.DisplayHistory = displayHistory;
window.PlayHistoryMusic = playHistoryMusic;

let channel_controller;
let channel_player;
let j_result1;
let j_result2;
let j_result3;
let history_data;
let historyList;

onload = async function(){
	// webSocketリレーの初期化
	var relay = RelayServer("chirimentest", "chirimenSocket" );
	channel_controller = await relay.subscribe("controllerCourage");
	console.log("web socketリレーサービス(controller)に接続しました");
  channel_player = await relay.subscribe("playerCourage");
	console.log("web socketリレーサービス(player)に接続しました");
	channel_controller.onmessage = getMessage;
  j_result1 = document.getElementById("j_result1");
  j_result2 = document.getElementById("j_result2");
  j_result3 = document.getElementById("j_result3");
  history_data = document.getElementById("history_data");
}

// メッセージを受信したときに起動する関数
function getMessage(msg) {
	let mdata = msg.data;
	console.log("mdata(受信):", mdata);
  mdata.datetime = getNow();
  console.log(getNow())
  sendMessage(mdata);
  displayMessage(mdata);
  saveLocalStorage(mdata);
}

// メッセージを送信するときに起動する関数
function sendMessage(msg) {
  // channel_player.send(msg);
	console.log("mdata(送信):", msg);
}

// Webアプリへの値表示関数
function displayMessage(msg) {
  let count = 0;
  let count_notes = 0;

  //距離
  let html1 = "<table>";
  //html1 += "<caption>" + data.caption + "</caption>";
  for(let command of msg.controllers){
    //html1 += "<tr><th>" + command.command + "</th><td>" + command.value.v1 + "</td></tr>";
    count += 1;
    html1 += "<tr><th>" + count + "</th><td>"+ command.playlist_preset + "</td></tr>";
  }

  html1 += "</table>";
  //html1 += "<p>ぜんぶで" + msg.controllers.length + "つのコントローラを使用しています";    // 要素memberの配列要素数
  j_result1.innerHTML = html1;

  //高さ
  let html2 = "<table>";
  count = 0;
  //html2 += "<caption>" + data.caption + "</caption>";
  for(let command of msg.controllers){
    count += 1;
    count_notes = 0;
    for (let note of command.notes) {
      count_notes += 1;
      html2 += "<tr><th>" + count + "-" + count_notes + "</th><td>" + note + "</td></tr>";
    }
  }
  html2 += "</table>";
  //html2 += "<p>ぜんぶで" + msg.controllers.length + "つのコントローラを使用しています";    // 要素memberの配列要素数
  j_result2.innerHTML = html2;

  //向き
  let html3 = "<table>";
  count = 0;
  //html3 += "<caption>" + data.caption + "</caption>";
  for(let command of msg.controllers){
    count += 1;
    html3 += "<tr><th>" + count + "</th><td>" + command.drum_pattern + "</td></tr>";
  }
  html3 += "</table>";
  //html3 += "<p>ぜんぶで" + msg.controllers.length + "つのコントローラを使用しています";    // 要素memberの配列要素数
  j_result3.innerHTML = html3;
}

// 現在日時を取得する関数
function getNow() {
  var date = new Date();
  var datetime = date.getFullYear() + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' +('0' + date.getDate()).slice(-2) + ' ' +  ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);
	return datetime;
}

// ローカルストレージへの保存関数
function saveLocalStorage(msg) {
  localStorage.setItem(msg["request_id"], JSON.stringify(msg));
  // console.log("localStorage保存数: " + localStorage.length);
  // console.log(JSON.parse(localStorage.getItem("1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed"))["request_id"]);
}

// キーからローカルストレージ上のデータ取得関数
function getLocalStorage(key) {
  let data = JSON.parse(localStorage.getItem(key));
  return data;
}

// ローカルストレージ上のデータをすべて取得する関数
function getListLocalStorage() {
  let dataList = [];
  for(let i = (localStorage.length - 1); 0 <= i; i--) {
    dataList.push(getLocalStorage(localStorage.key(i)));
  }
  return dataList;
}

// 履歴表示
function displayHistory() {
  let html = "";
  historyList = getListLocalStorage();
  let count = 0;
  for(let history of historyList){
    html += "<li>" + history.datetime + "<button class=\"Button-style\" onclick=\"DisplayDetail(" + count + ")\">詳細</button><button class=\"Button-style\" onclick=\"PlayHistoryMusic(" + count + ")\">再生</button></li>";
    count++;
  }
  history_data.innerHTML = html;
}

// 詳細情報表示関数
function displayDetail(num) {
  footerSelect(0);  // 設計書画面に遷移
  displayMessage(historyList[num]);
}

// 履歴再生関数
function playHistoryMusic(num) {
  displayDetail(num);
  sendMessage(historyList[num]);
}

// テストメッセージを送信するときに起動する関数
function testSendMessage(){
  let testMsg = {
    "request_id": "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
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
        "playlist_preset": "F" // "G7", "C", "Dm", "F": コントローラー固有のコード
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
        "playlist_preset": "C"
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
        "playlist_preset": "Dm"
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
  channel_player.send(testMsg);
	console.log("mdata(送信):", testMsg);
}
