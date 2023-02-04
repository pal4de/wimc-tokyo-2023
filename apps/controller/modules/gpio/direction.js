//@ts-check

// ジャイロセンサーからコントローラーの向きを判別する。
import MPU6050 from "@chirimen/mpu6050";
import { controller, sleep } from "../common.js";
import { i2cPort } from "./index.js";

/** @typedef {"up" | "down" | "left" | "right"} Direction */
/** @type {Direction} */
export let direction;  // 向き

/** @type {Record<Direction, import("../common.js").DrumPattern>} */
const directionDrumPatternMap = {
  up: 0,
  down: 1,
  left: 2,
  right: 3,
}

export async function startDirectionSensor() {
  const mpu6050 = new MPU6050(i2cPort, 0x68);
  await mpu6050.init();

  while (true) {
    const data = await mpu6050.readAll();

    const accel = [data.gx, data.gy, data.gz];
    // const gyro = [data.rx, data.ry, data.rz];
    const value_direction = Math.atan2(accel[0], accel[2]) * 1000 * Math.PI / 90;
    if (-30 <= value_direction && value_direction <= 30) { // TODO: 全体が完成し次第、値の調整
      direction = "down";
    } else if (30 < value_direction && value_direction < 75) {
      direction = "right";
    } else if (-75 < value_direction && value_direction < -30) {
      direction = "left";
    } else {
      direction = "up";
    }

    // console.debug(direction);
    controller.drum_pattern = directionDrumPatternMap[direction];

    await sleep(100);
  }
}