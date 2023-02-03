export class PresetDrum {
    constructor(player, pattern) {
        this.player = player;
        this.pattern = pattern;
        this.instrument = ''
        this.patterns = [];

        this.patterns[1] = [1, 2, 2, 1];
        this.patterns[2] = [1, 2, 1, 2];
        this.patterns[3] = [1, 2, 2, 1];
        this.patterns[4] = [2, 2, 1, 1];
    }

    getSoundPath(type) {
        if (type == 1) {
            // kick drum
            this.instrument = 'Kick Drum'
        } else if (type == 2) {
            // snare drum
            this.instrument = 'Snare Drum'
        }

        return `./music/${this.instrument}.wav`;
    }

    get drumPatterns() {
        return this.patterns[this.pattern];
    }

    async play() {
        for (const type of this.drumPatterns) {
            await this.player.play({
                path: this.getSoundPath(type),
                sync: true
            });

            console.log('📣 play sound :', this.instrument);
        }
    }
}
