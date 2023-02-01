import fs from 'fs';
import child_process from 'child_process';

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

async function speaker() {
  // PWM設定
  exec('ls /sys/class/pwm/pwmchip0 | grep pwm1', (error) => {
    if (error) {
      console.log("exec setPWM");
      setPWM();
    }
  })
  await sleep(5000);

  // 周期(nsec)
  const PERIOD = Math.floor(1000000000 / FREQ["(ド)"]);
  // パルス幅(nsec)
  const PWIDTH = Math.floor(PERIOD / 2);
  // 周期設定
  await setSpeakerConfig(FILE_PERIOD, PERIOD);
  // パルス幅設定
  await setSpeakerConfig(FILE_PWIDTH, PWIDTH);
  // 出力開始
  await setSpeakerConfig(FILE_POWER, POWER["ON"]);
  // 5秒間出力状態継続
  await sleep(5000);
  // 出力停止
  await setSpeakerConfig(FILE_POWER, POWER["OFF"]);
}

// スピーカー設定関数
async function setSpeakerConfig(file, value) {
  await fs.writeFile(file, String(value), function (err) {
    if (err) throw err;
    console.log('Set Success: ' + value);
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

speaker()
