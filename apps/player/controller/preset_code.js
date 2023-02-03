export class PresetCode {
    constructor(player, code, note) {
        this.player = player
        this.code = code;
        this.note = note;
        this.pitches = [];

        if (code == "C") {
            this.pitches = ["", "C5", "E5", "G5", "B5"]
        } else if (code == "Dm") {
            this.pitches = ["", "D5", "F5", "A5", "C5"]
        } else if (code == "F") {
            this.pitches = ["", "F5", "A5", "C5", "E5"]
        } else if (code == "G7") {
            this.pitches = ["", "G5", "B5", "D5", "F5"]
        }
    }

    get soundPath() {
        return `./music/Glo${this.pitches[this.note]}.wav`;
    }

    get sound() {
        return this.pitches[this.note];
    }

    async play() {
        console.log('📣 play sound :', this.sound);
        await this.player.play({
            path: this.soundPath,
            sync: true
        }).then(() => {
        }).catch((error) => {
            console.error(error);
        });
    }
}
