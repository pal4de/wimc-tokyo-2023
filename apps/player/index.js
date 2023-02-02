import player from 'node-wav-player';
import { PresetCode } from './controller/preset_code.js'

const c = new PresetCode(player, "C", 3);
const Dm = new PresetCode(player, "Dm", 4);

await c.play();
await Dm.play();