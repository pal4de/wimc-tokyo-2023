//@ts-check

import { buttonEventEmitter, initButton, watchButton } from "./button.js";
import { initGPIO } from "./index.js";

await initGPIO();
await initButton();

buttonEventEmitter.on("pressed", type => {
    console.log(type);
})
watchButton();
