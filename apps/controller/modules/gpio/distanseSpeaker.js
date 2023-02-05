//@ts-check

import VL53L0X from "@chirimen/vl53l0x";
import childProsess, { execSync } from 'child_process';
import { promises as fs, writeFileSync } from 'fs';
import { OperationError } from "node-web-i2c";
import { promisify } from 'util';
import { controller, sleep } from "../common.js";
import { buttonEventEmitter } from "./button.js";
import { direction } from "./direction.js";
import { getI2CPort } from "./index.js";

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

export let notesArrayPointer = 0;

/** @type {Note} */
let currentNote = 0;

/** @type {[Note, Note, Note, Note]} */
export let currentNotes = [0, 0, 0, 0];

export let isBuzzering = false;

process.on('exit', () => execSync(`echo ${POWER["OFF"]} > ${FILE_POWER}`));
process.on('SIGINT', () => execSync(`echo ${POWER["OFF"]} > ${FILE_POWER}`));

export async function initDistanceSensor() {
  console.log("初期化: 測距センサー");

  vl = new VL53L0X(await getI2CPort(), 0x29);
  await vl.init(); // for Long Range Mode (<2m) : await vl.init(true);

  // PWM設定
  try {
    await exec('ls /sys/class/pwm/pwmchip0 | grep pwm1');
  } catch (error) {
    await setupPWM();
  }
}

export async function startDistanceSensor() {
  // 並行実行
  watchDistance();
  playSound();

  buttonEventEmitter.on('pressedShort', () => {
    if (direction !== "up") return;

    controller.notes[notesArrayPointer] = currentNote;
    notesArrayPointer += 1;
    notesArrayPointer %= controller.notes.length;
  })
}

async function watchDistance() {
  while (true) {
    try {
      await sleep(300);
      let distance = await vl.getRange();
      if (direction !== "up") {
        isBuzzering = false
        continue
      };

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
      currentNotes = [...controller.notes];
      currentNotes[notesArrayPointer] = currentNote

      isBuzzering = currentNote > 0;
    } catch (err) {
      // たまにミスが発生？握りつぶしちゃダメなやつかも
      // エラーが発生した後まったく成功しないなら要対応
      if (err instanceof OperationError) {
        console.error("測距でのオペレーションエラー:", err)
      } else {
        throw err;
      }
    }
  }
}

async function playSound() {
  while (true) {
    await sleep(300);
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

// スピーカー出力開始関数
async function startSpeaker(freq) {
  // 周期(nsec)
  const PERIOD = Math.floor(1000000000 / freq);
  // パルス幅(nsec)
  const PWIDTH = Math.floor(PERIOD / 2);

  // パルス幅設定
  await fs.writeFile(FILE_PWIDTH, String(PWIDTH));
  await sleep(10);

  // 周期設定
  await fs.writeFile(FILE_PERIOD, String(PERIOD));
  await sleep(10);

  // 出力開始
  await fs.writeFile(FILE_POWER, String(POWER["ON"]));
  await sleep(10);
}

// スピーカー出力停止関数
async function stopSpeaker() {
  // 出力停止
  await fs.writeFile(FILE_POWER, String(POWER["OFF"]));
  await sleep(10);
}

// PWM有効化関数
async function setupPWM() {
  await fs.writeFile(FILE_PWM, '0');
  await sleep(10);

  await fs.writeFile(FILE_PWM, '1');
  await sleep(10);

  await fs.writeFile(FILE_PERIOD, '20000000');
  await sleep(10);

  await fs.writeFile(FILE_PWIDTH, '10000000');
  await sleep(10);
}