import {requestGPIOAccess} from "./node_modules/node-web-gpio/dist/index.js";
const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
const gpioAccess = await requestGPIOAccess();
const port5 = gpioAccess.ports.get(5);

async function switchCheck() {
  await port5.export("in");
  while (true) {
    var val = await port5.read();
    if (val == 0) {
      console.log("ON");
    } else {
      console.log("OFF");
    }
    await sleep(100);
  }
}

switchCheck();
