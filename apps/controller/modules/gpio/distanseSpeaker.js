//@ts-check

import VL53L0X from "@chirimen/vl53l0x";
import childProsess from 'child_process';
import { promises as fs, writeFileSync } from 'fs';
import { promisify } from 'util';
import { controller, sleep } from "../common.js";
import { buttonPressed } from './button.js';
import { direction } from "./direction.js";
import { i2cPort } from "./index.js";

const exec = promisify(childProsess.exec);

/**
 * @typedef {import("../common").Note} Note
 */

// PWM設定ファイルパス
const FILE_PWM = '/sys/class/pwm/pwmchip0/export';
// 周期記載ファイルパス
const FILE_PERIOD = '/sys/class/pwm/pwmchip0/pwm1/period';
// パルス幅記載ファイルパス
const FILE_PWIDTH = '/sys/class/pwm/pwmchip0/pwm1/duty_cycle';
// 出力指定ファイルパス
const FILE_POWER = '/sys/class/pwm/pwmchip0/pwm1/enable';

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

// 出力指定リスト(JSON)
const POWER = {
  "OFF": 0,
  "ON": 1
};

/** @type {{ getRange(): Promise<number>, init(): Promise<void> }} */
export let vl;

/** @type {Note} */
let currentNote = 0;

process.on('exit', () => writeFileSync(FILE_POWER, String(POWER["OFF"])));
process.on('SIGINT', () => writeFileSync(FILE_POWER, String(POWER["OFF"])));

export async function startDistanceSensor() {
  console.log("初期化: 測距センサー");

  vl = new VL53L0X(i2cPort, 0x29);
  await vl.init(); // for Long Range Mode (<2m) : await vl.init(true);

  // PWM設定
  try {
    await exec('ls /sys/class/pwm/pwmchip0 | grep pwm1');
  } catch (error) {
    console.error("PWM初期化中のエラー:", error);
    await setPWM();
  }

  // 並行実行
  watchDistance();
  watchShortPress();
  playSound();
}

async function watchDistance() {
  while (true) {
    let distance = await getDistance();
    if (direction !== "up") continue;

    if (distance < 100) {
      currentNote = 0;
    } else if (distance < 200) {
      currentNote = 1;
    } else if (distance < 300) {
      currentNote = 2;
    } else if (distance < 400) {
      currentNote = 3;
    } else {
      currentNote = 4;
    }

    await sleep(100);
  }
}

async function playSound() {
  while (true) {
    await sleep(100);
    if (direction !== "up") {
      stopSpeaker();
      continue;
    }

    switch (currentNote) {
      case 1: {
        startSpeaker(FREQ["ド"]);
        break;
      }
      case 2: {
        startSpeaker(FREQ["ミ"]);
        break;
      }
      case 3: {
        startSpeaker(FREQ["ソ"]);
        break;
      }
      case 4: {
        startSpeaker(FREQ["シ"]);
        break;
      }
      default: {
        stopSpeaker();
        break;
      }
    }
  }
}

async function watchShortPress() {
  let notesArrayPointer = 0;
  while (true) {
    if (await buttonPressed() === 'short') {
      if (direction !== "up") continue;

      controller.notes[notesArrayPointer] = currentNote;
      notesArrayPointer += 1;
      notesArrayPointer %= controller.notes.length;
    }
  }
}

// スピーカー出力開始関数
async function startSpeaker(freq) {
  // 周期(nsec)
  const PERIOD = Math.floor(1000000000 / freq);
  // パルス幅(nsec)
  const PWIDTH = Math.floor(PERIOD / 2);
  // 周期設定
  await fs.writeFile(FILE_PERIOD, String(PERIOD));
  // パルス幅設定
  await fs.writeFile(FILE_PWIDTH, String(PWIDTH));
  // 出力開始
  await fs.writeFile(FILE_POWER, String(POWER["ON"]));
}

// スピーカー出力停止関数
async function stopSpeaker() {
  // 出力停止
  await fs.writeFile(FILE_POWER, String(POWER["OFF"]));
}

// PWM有効化関数
async function setPWM() {
  await exec('sudo dtoverlay pwm-2chan pin=' + PIN_PWM["1"] + ' func=4 pin2=' + PIN_PWM["2"] + ' func2=4')
  console.log('sudo dtoverlay pwm-2chan pin=' + PIN_PWM["1"] + ' func=4 pin2=' + PIN_PWM["2"] + ' func2=4')

  await sleep(1000);

  await exec('sudo echo 0 > ' + FILE_PWM)
  console.log('sudo echo 0 > ' + FILE_PWM)

  await sleep(1000);

  await exec('sudo echo 1 > ' + FILE_PWM)
  console.log('sudo echo 1 > ' + FILE_PWM)
}

// 距離取得関数
async function getDistance() {
  const distance_result_get = await vl.getRange();
  // console.debug(`${distance_result_get} [mm]`);
  return distance_result_get;
}
