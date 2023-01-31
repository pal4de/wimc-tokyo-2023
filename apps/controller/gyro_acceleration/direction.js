// ジャイロセンサーからコントローラーの向きを判別する。
import {requestGPIOAccess} from "./node_modules/node-web-gpio/dist/index.js";
import {requestI2CAccess} from "./node_modules/node-web-i2c/index.js";
import MPU6050 from "@chirimen/mpu6050";

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
let direction;  // 向き

async function main() {
  const gpioAccess = await requestGPIOAccess();
  const port5 = gpioAccess.ports.get(5);
  await port5.export("in");
  let flag = false;  //回転認識用のフラグ
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
        sendResult(direction);
      }
    }
    await sleep(100);
  }
}

async function checkRotation() {
  var i2cAccess = await requestI2CAccess();
  var port = i2cAccess.ports.get(1);
  var mpu6050 = new MPU6050(port, 0x68);
  await mpu6050.init();
  const data = await mpu6050.readAll();
  const accel = [data.gx, data.gy, data.gz];
  const gyro =[data.rx, data.ry, data.rz];
  const value_direction = Math.atan2(accel[0], accel[2]) * 1000 * Math.PI / 90;
  if (-30 <= value_direction && value_direction <= 30) {
    direction = "up";
  } else if (30 < value_direction && value_direction < 75) {
    direction = "left";
  } else if (-75 < value_direction && value_direction < -30) {
    direction = "right";
  } else {
    direction = "down";
  }
}

async function sendResult(result) {
  console.log(result)
}

main();
