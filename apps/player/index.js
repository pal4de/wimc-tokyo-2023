import player from 'node-wav-player';
import { PresetCode } from './controller/preset_code.js'
import { PresetDrum } from './controller/preset_drum.js'

const c = new PresetCode(player, "C", 3);
const Dm = new PresetCode(player, "Dm", 4);
const DrArrayDm = new PresetDrum(player, 2)

await c.play();
await Dm.play();
DrArrayDm.play();