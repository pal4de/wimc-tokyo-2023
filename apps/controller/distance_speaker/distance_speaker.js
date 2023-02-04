// return: 0:無音,1:低音,2:中低音,3:中高音,4:高音
import {requestI2CAccess} from "./node_modules/node-web-i2c/index.js";
import {requestGPIOAccess} from "./node_modules/node-web-gpio/dist/index.js";
import VL53L0X from "@chirimen/vl53l0x";
import fs from 'fs';
import child_process from 'child_process';
import { networkInterfaces } from "os";

const {exec} = child_process;
const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

// 周波数リスト(Hz)
const FREQ = {
  "ド": 523,
  "レ": 587,
  "ミ": 659,
  "ファ": 698,
  "ソ": 784,
  "ラ": 880,
  "シ": 988,
  "(ド)": 1047
};
// PWM有効化GPIOピンリスト
const PIN_PWM = {
  "1": 12,
  "2": 13
};
// PWM設定ファイルパス
const FILE_PWM = '/sys/class/pwm/pwmchip0/export';
// 周期記載ファイルパス
const FILE_PERIOD = '/sys/class/pwm/pwmchip0/pwm1/period';
// パルス幅記載ファイルパス
const FILE_PWIDTH = '/sys/class/pwm/pwmchip0/pwm1/duty_cycle';
// 出力指定リスト(JSON)
const POWER = {
  "OFF": 0,
  "ON": 1
};
// 出力指定ファイルパス
const FILE_POWER = '/sys/class/pwm/pwmchip0/pwm1/enable';

const i2cAccess = await requestI2CAccess();
const port1 = i2cAccess.ports.get(1);
const vl = new VL53L0X(port1, 0x29);
await vl.init(); // for Long Range Mode (<2m) : await vl.init(true);
const gpioAccess = await requestGPIOAccess();
const port5 = gpioAccess.ports.get(5);
// 出力音程リスト
export let notes = [0, 0, 0, 0];
let count = 0

// 距離に応じた高さの音を出力する関数
export async function distance_speaker() {
  // PWM設定
  exec('ls /sys/class/pwm/pwmchip0 | grep pwm1', (error) => {
    if (error) {
      // console.log("exec setPWM");
      setPWM();
    }
  });
  await sleep(5000);
  await port5.export("in");
  let distance;
  notes = [0, 0, 0, 0];
  count = 0;
  while (true) {
    var val = await port5.read();
    if (val == 0) {
      determineDistance(count);
      count += 1;
      if (4 <= count) {
        await sleep(2000);
        displayResult(notes);
        stopSpeaker();
        return notes;
      }
    } else {
      distance = await getDistance();
      if (Number(distance) < 300) {
        stopSpeaker();
      } else if (300 <= Number(distance) && Number(distance) < 600) {
        stopSpeaker();
        startSpeaker(FREQ["ド"]);
      } else if (600 <= Number(distance) && Number(distance) < 900) {
        stopSpeaker();
        startSpeaker(FREQ["ミ"]);
      } else if (900 <= Number(distance) && Number(distance) < 1200) {
        stopSpeaker();
        startSpeaker(FREQ["ソ"]);
      } else {
        stopSpeaker();
        startSpeaker(FREQ["シ"]);
      }
    }
    await sleep(100);
  }
}

// スピーカー出力開始関数
async function startSpeaker(freq) {
  // 周期(nsec)
  const PERIOD = Math.floor(1000000000 / freq);
  // パルス幅(nsec)
  const PWIDTH = Math.floor(PERIOD / 2);
  // 周期設定
  await setSpeakerConfig(FILE_PERIOD, PERIOD);
  // パルス幅設定
  await setSpeakerConfig(FILE_PWIDTH, PWIDTH);
  // 出力開始
  await setSpeakerConfig(FILE_POWER, POWER["ON"]);
}
// スピーカー出力停止関数
async function stopSpeaker() {
  // 出力停止
  await setSpeakerConfig(FILE_POWER, POWER["OFF"]);
}

// スピーカー設定関数
async function setSpeakerConfig(file, value) {
  await fs.writeFile(file, String(value), function (err) {
    if (err) throw err;
    // console.log('Set Success: ' + value);
  });
}

// PWM有効化関数
async function setPWM() {
  await exec('sudo dtoverlay pwm-2chan pin=' + PIN_PWM["1"] + ' func=4 pin2=' + PIN_PWM["2"] + ' func2=4', (error) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
  })
  await sleep(1000);
  await exec('sudo echo 0 > ' + FILE_PWM, (error) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
  })
  sleep(1000);
  await exec('sudo echo 1 > ' + FILE_PWM, (error) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
  })
}

// 距離取得関数
async function getDistance() {
  const distance_result_get = await vl.getRange();
  // console.log(`${distance_result_get} [mm]`);
  return distance_result_get;
}

// 距離確定関数
async function determineDistance(num) {
  const distance_result_determine = await vl.getRange();
  console.log(`${distance_result_determine} [mm]`);
  notes.splice((num % 5), 1, distance_result_determine);
}

// 結果出力関数
async function displayResult(result) {
  console.log('音程リスト' + result)
}

distance_speaker()
