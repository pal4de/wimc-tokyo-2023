//@ts-check

// ジャイロセンサーからコントローラーの向きを判別する。
import MPU6050 from "@chirimen/mpu6050";
import { sleep } from "../common.js";
import { i2cPort } from "./index.js";

/** @type {"up" | "down" | "left" | "right"} */
export let direction;  // 向き

export async function gyroAcceleration() {
  const mpu6050 = new MPU6050(i2cPort, 0x68);
  await mpu6050.init();

  while (true) {
    const data = await mpu6050.readAll();

    const accel = [data.gx, data.gy, data.gz];
    const gyro = [data.rx, data.ry, data.rz];
    const value_direction = Math.atan2(accel[0], accel[2]) * 1000 * Math.PI / 90;
    if (-30 <= value_direction && value_direction <= 30) { // TODO: 全体が完成し次第、値の調整
      direction = "up";
    } else if (30 < value_direction && value_direction < 75) {
      direction = "left";
    } else if (-75 < value_direction && value_direction < -30) {
      direction = "right";
    } else {
      direction = "down";
    }

    await sleep(100);
  }
}