// ジャイロセンサーからコントローラーの向きを判別する。
import { requestGPIOAccess } from "node-web-gpio";
import { requestI2CAccess } from "node-web-i2c";
import MPU6050 from "@chirimen/mpu6050";

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
let count = 0; // 半周カウント

async function main() {
  const gpioAccess = await requestGPIOAccess();
  const port5 = gpioAccess.ports.get(5);
  await port5.export("in");
  let flag = false;  //回転認識用のフラグ
  let circle;
  while (true) {
    var val = await port5.read();
    if (val == 0) {
      if (!flag) {
        flag = true;
      }
      checkRotation();
    } else {
      if (flag) {
        flag = false;
        circle = Math.ceil(count / 2);
        sendResult(circle);
        count = 0;
        circle = 0;
      }
    }
    await sleep(500);
  }
}

async function checkRotation() {
  var i2cAccess = await requestI2CAccess();
  var port = i2cAccess.ports.get(1);
  var mpu6050 = new MPU6050(port, 0x68);
  await mpu6050.init();
  const data = await mpu6050.readAll();
  const accel = [data.gx, data.gy, data.gz];
  const gyro = [data.rx, data.ry, data.rz];
  let value_judge = 0;  // 周回判断基準値
  console.log(gyro[2]);
  if (value_judge == 0) {
    if (gyro[2] < 0) {
      count += 1;
    } else if (gyro[2] > 0) {
      count += 1;
    }
  } else if (0 < value_judge && gyro[2] < 0) {
    count += 1;
  } else if (value_judge < 0 && 0 < gyro[2]) {
    count += 1;
  }
}

async function sendResult(result) {
  console.log(result)
}

main();
