const url = "sample.json";    // JSONファイル名
//let j_result;
let j_result1;
let j_result2;
let j_result3;
 
// JSONファイルを整形して表示する
function formatJSON(data){
    // // 整形して表示 一覧
    // let html = "<table>";
    // html += "<caption>" + data.caption + "</caption>";
    // for(let command of data.commands){
    //     html += "<tr><td>" + command.btAddress + "</td><td>" + command.command + "</td><td>" + command.value.v1 + "</td><td>" + command.value.v2 + "</td><td>" + command.value.v3 + "</td></tr>";
    // }
    // html += "</table>";
    // html += "<p>ぜんぶで" + data.commands.length + "つのコントローラを使用しています";    // 要素memberの配列要素数
    // j_result.innerHTML = html;

    //距離
    let html1 = "<table>";
    let h1Array =[];
    //html1 += "<caption>" + data.caption + "</caption>";
    for(let command of data.commands){
        //html1 += "<tr><th>" + command.command + "</th><td>" + command.value.v1 + "</td></tr>";
        h1Array.push(command.value.v1);
    }
    var h1h0 = h1Array[1] - h1Array[0];
    var h2h1 = h1Array[2] - h1Array[1];
    var h3h2 = h1Array[3] - h1Array[2];
    html1 += "<tr><th>①</th><td>"+ h1h0 + "cm</td></tr>";
    html1 += "<tr><th>②</th><td>"+ h2h1 + "cm</td></tr>";
    html1 += "<tr><th>③</th><td>"+ h3h2 + "cm</td></tr>";
    
    html1 += "</table>";
    //html1 += "<p>ぜんぶで" + data.commands.length + "つのコントローラを使用しています";    // 要素memberの配列要素数
    j_result1.innerHTML = html1;

    //つまみ
    let html2 = "<table>";
    //html2 += "<caption>" + data.caption + "</caption>";
    for(let command of data.commands){
        html2 += "<tr><th>" + command.command + "</th><td>" + command.value.v2 + "</td></tr>";
    }
    html2 += "</table>";
    //html2 += "<p>ぜんぶで" + data.commands.length + "つのコントローラを使用しています";    // 要素memberの配列要素数
    j_result2.innerHTML = html2;

    //角度
    let html3 = "<table>";
    //html3 += "<caption>" + data.caption + "</caption>";
    for(let command of data.commands){
        html3 += "<tr><th>" + command.command + "</th><td>" + command.value.v3 + "度</td></tr>";
    }
    html3 += "</table>";
    //html3 += "<p>ぜんぶで" + data.commands.length + "つのコントローラを使用しています";    // 要素memberの配列要素数
    j_result3.innerHTML = html3;
}
 
// 起動時の処理
window.addEventListener("load", ()=>{
    // JSON表示用
    //j_result = document.getElementById("j_result");
    j_result1 = document.getElementById("j_result1");
    j_result2 = document.getElementById("j_result2");
    j_result3 = document.getElementById("j_result3");
 
    // JSONファイルを取得して表示
    fetch(url)
        .then( response => response.json())
        .then( data => formatJSON(data));
 
});
