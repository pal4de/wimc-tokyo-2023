import fs from 'fs';

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

async function main() {
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
  // 10秒間出力状態継続
  await sleep(10000);
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

main()
