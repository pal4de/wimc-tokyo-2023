//@ts-check

// ジャイロセンサーからコントローラーの向きを判別する。
import MPU6050 from "@chirimen/mpu6050";
import { OperationError } from "node-web-i2c";
import { controller, sleep } from "../common.js";
import { getI2CPort } from "./index.js";

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

/** @type {{ init(): Promise<void>, readAll(): Promise<{gx: number, gy: number, gz: number, rx: number, ry: number, rz: number}> }} */
let mpu6050;

export async function initDirectionSensor() {
  mpu6050 = new MPU6050(await getI2CPort(), 0x68);
  await mpu6050.init();
}

export async function startDirectionSensor() {

  while (true) {
    try {
      const data = await mpu6050.readAll();

      const gyro = [data.gx, data.gy, data.gz];
      // const accel = [data.rx, data.ry, data.rz];
      const value_direction = Math.atan2(gyro[0], gyro[2]) * 1000 * Math.PI / 90;
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
    } catch (err) {
      // たまにミスが発生？握りつぶしちゃダメなやつかも
      // エラーが発生した後まったく成功しないなら要対応
      if (err instanceof OperationError) {
        console.error("方向検知でのオペレーションエラー:", err)
      } else {
        throw err;
      }
    }

    await sleep(100);
  }
}