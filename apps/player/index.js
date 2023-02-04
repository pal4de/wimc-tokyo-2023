import player from 'node-wav-player';
import { PresetCode } from './controller/preset_code.js'
import { PresetDrum } from './controller/preset_drum.js'
import { mokRequest } from './request.js';
import { TEMPO } from './const.js';

// const C = new PresetCode(player, "C", 3);
// const Dm = new PresetCode(player, "Dm", 4);
// const F = new PresetCode(player, "F", 4);
// const G = new PresetCode(player, "F", 4);
// const DrArrayDm = new PresetDrum(player, 1)

export async function musicPlay(controllers) {
    let code;
    let drum;

    for (const c of controllers) {
        code = new PresetCode(player, c.playlist_preset, c.notes);
        drum = new PresetDrum(player, c.drum_pattern);


        await new Promise((resolve) => {
            setTimeout(() => {
                console.log('📣 change next controller...');
                console.log('');
                code.play();
                // drum.play();
                resolve();
            }, TEMPO * 4);
        });
    }
}
