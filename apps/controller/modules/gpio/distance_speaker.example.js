//@ts-check

import { initGPIO } from "./index.js";
import { initDistanceSensor, startDistanceSensor } from "./distance_speaker.js";

(async () => {
  await initGPIO();
  await initDistanceSensor();
  console.log("初期化が完了");
  startDistanceSensor()
})()