import { TEMPO, ABSOULT_PATH } from '../const.js'
``
export class PresetCode {
    constructor(player, code, notes) {
        this.player = player
        this.code = code;
        this.notes = notes;
        this.pitches = [];

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
        return ABSOULT_PATH + `Ba${this.code}1.wav`; 
    }

    get codePath() {
        return ABSOULT_PATH + `${this.code}.wav`;
    }

    getSoundPath(note) {
        return ABSOULT_PATH + `Glo${note}.wav`;
    }

    get sound() {
        return this.pitches[this.note];
    }

    async play() {
        console.log('pwd', process.cwd());

        this.player.play({
            path: this.codePath,
        });

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
                        // sync: true,
                    });
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
