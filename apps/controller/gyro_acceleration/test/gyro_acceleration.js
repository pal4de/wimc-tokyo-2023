import {requestGPIOAccess} from "./node_modules/node-web-gpio/dist/index.js";
import {requestI2CAccess} from "./node_modules/node-web-i2c/index.js";
import MPU6050 from "@chirimen/mpu6050";
const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));


async function switchCheck() {
  const gpioAccess = await requestGPIOAccess();
  const port5 = gpioAccess.ports.get(5);
  await port5.export("in");
  while (true) {
    var val = await port5.read();
    if (val == 0) {
      mpu6050();
    }
    await sleep(500);
  }
}

async function mpu6050() {
  var i2cAccess = await requestI2CAccess();
  var port = i2cAccess.ports.get(1);
  var mpu6050 = new MPU6050(port, 0x68);
  await mpu6050.init();
  const data = await mpu6050.readAll();
  const temperature = data.temperature.toFixed(2);
  const g = [data.gx, data.gy, data.gz];
  const r = [data.rx, data.ry, data.rz];
  console.log(
    [
      `Temperature: ${temperature} degree`,
      `(加速度) Gx: ${g[0]}, Gy: ${g[1]}, Gz: ${g[2]}`,
      `(角速度) Rx: ${r[0]}, Ry: ${r[1]}, Rz: ${r[2]}`
    ].join("\n")
  );
}

switchCheck();
