import { TEMPO, PATH } from '../util/const.js'

export class PresetCode {
    /**
     * @param {WavPlayer} player 
     * @param {number} code 
     * @param {number} notes 
     */
    constructor(player, code, notes) {
        this.player = player
        this.code = code;
        this.notes = notes;
        this.pitches = [];

        // init code pitches
        if (code == "C") {
            this.pitches = ["", "C5", "E5", "G5", "B5"];
        } else if (code == "Dm") {
            this.pitches = ["", "D5", "F5", "A5", "C5"];
        } else if (code == "F") {
            this.pitches = ["", "F5", "A5", "C5", "E5"];
        } else if (code == "G7") {
            this.pitches = ["", "G5", "B5", "D5", "F5"];
        }
    }

    get basePath() {
        return PATH + `Ba${this.code}1.wav`;
    }

    get codePath() {
        return PATH + `${this.code}.wav`;
    }

    /**
     * @param {string} note 
     */
    getSoundPath(note) {
        return PATH + `Glo${note}.wav`;
    }

    async play() {
        // コード音再生
        this.player.play({
            path: this.codePath,
        });

        // 小節の4音をtempoで指定した時間を空けて再生する
        for (let note of this.notes) {
            if (note === 0) {
                await new Promise((resolve) => {
                    setTimeout(() => {
                        console.log('📣 play note sound : MUTE')
                    }, TEMPO);
                    resolve();
                })

                continue;
            }

            note = this.pitches[note];

            await new Promise((resolve) => {
                setTimeout(() => {
                    this.player.play({
                        path: this.getSoundPath(note),
                    });
                    // 追加でbase音も一緒に再生する
                    this.player.play({
                        path: this.basePath,
                    });

                    console.log('📣 play note sound :', this.getSoundPath(note));
                    console.log('📣 play base sound :', this.basePath);

                    resolve();
                }, TEMPO);
            });
        }
    }
}
