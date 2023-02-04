//@ts-check

import { buttonPressed, initGPIO } from "./button.js";

await initGPIO();
while (true) {
    console.log(await buttonPressed());
}
