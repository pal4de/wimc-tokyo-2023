import { PATH, TEMPO } from '../util/const.js'

export class PresetDrum {
    /**
     * @param {WavPlayer} player 
     * @param {number} pattern 
     */
    constructor(player, pattern) {
        this.player = player;
        this.pattern = pattern;
        this.instrument = ''
        this.patterns = [];

        // init drum patterns
        this.patterns[1] = [1, 2, 2, 1];
        this.patterns[2] = [1, 2, 1, 2];
        this.patterns[3] = [1, 2, 2, 1];
        this.patterns[4] = [2, 2, 1, 1];
    }

    /**
     * @param {int} type 
     * @returns path
     */
    getSoundPath(type) {
        if (type == 1) {
            this.instrument = 'Kick Drum'
        } else if (type == 2) {
            this.instrument = 'Snare Drum'
        }

        return PATH + `${this.instrument}.wav`;
    }

    get drumPatterns() {
        return this.patterns[this.pattern];
    }

    async play() {
        // 小節の4音をtempoで指定した時間を空けて再生する
        for (const type of this.drumPatterns) {
            await new Promise((resolve) => {
                setTimeout(() => {
                    this.player.play({
                        path: this.getSoundPath(type),
                    });

                    console.log('📣 play sound :', this.getSoundPath(type));

                    resolve();
                }, TEMPO);
            });
        }
    }
}
