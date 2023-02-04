import player from 'node-wav-player';
import { PresetCode } from './controller/preset_code.js'
import { PresetDrum } from './controller/preset_drum.js'
import { TEMPO } from './util/const.js';

/**
 * 音楽再生
 * @param {array} controllers 
 */
export async function musicPlay(controllers) {
    let code;
    let drum;

    /** controller順番に沿って音を再生する */
    for (const c of controllers) {
        // set new object ...
        code = new PresetCode(player, c.playlist_preset, c.notes);
        drum = new PresetDrum(player, c.drum_pattern);

        /** 小節の4音を再生するので一つのcontrollerの演奏は TEMPO * 4 になる */
        await new Promise((resolve) => {
            setTimeout(() => {
                console.log('\n📣 Play New Cntroller ...  \n');

                code.play();
                drum.play();

                resolve();
            }, TEMPO * 4);
        });
    }
}
