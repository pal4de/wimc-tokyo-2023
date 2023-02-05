import { requestGPIOAccess } from "node-web-gpio";
const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

async function switchCheck() {
  const gpioAccess = await requestGPIOAccess();
  const port = gpioAccess.ports.get(5);

  await port.export("in");
  port.onchange = showPort;
}

function showPort(ev) {
  if (ev.value == 0) {
    console.log("ON");
  } else {
    console.log("OFF");
  }
}

switchCheck();
