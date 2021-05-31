class NoteBar {
    static BOTTOM_NOTE_BAR_TEXTURE = PIXI.Texture.from('assets/bottom-thing.png');
    static BOTTOM_NOTE_TEXTURE = PIXI.Texture.from('assets/bottom-note.png');

    static _sprite;

    // {beat: [leftSprite, rightSprite]}
    static _noteSprites = {};

    static initialize() {
        NoteBar._sprite = new PIXI.Sprite(NoteBar.BOTTOM_NOTE_BAR_TEXTURE);
        NoteBar._sprite.anchor.x = 0.5;
        NoteBar._sprite.anchor.y = 0.5;
        NoteBar._sprite.position.x = window.innerWidth / 2;
        NoteBar._sprite.position.y = window.innerHeight - 48 - 30;
        NoteBar._sprite.alpha = 0;
        Renderer.staticContainer.addChild(NoteBar._sprite);
    }

    static update(time, dt) {
        const currentBeat = MusicManager.getCurrentBeat(time);
        const currentBeatFloor = Math.floor(currentBeat);

        const bpm = MusicManager.getMSPerBeat();
        const clientEntity = EntityInformation.getClientEntity();
        if (clientEntity && bpm) {
            NoteBar._sprite.alpha = Math.min(NoteBar._sprite.alpha + 0.001 * dt, 1);
        } else {
            NoteBar._sprite.alpha = Math.max(NoteBar._sprite.alpha - 0.001 * dt, 0);
            for (const beatKey in NoteBar._noteSprites) {
                const [leftSprite, rightSprite] = NoteBar._noteSprites[beatKey];
                leftSprite.alpha = Math.max(leftSprite.alpha - 0.001 * dt, 0);
                rightSprite.alpha = Math.max(rightSprite.alpha - 0.001 * dt, 0);
            }
        }

        const keys = Object.keys(NoteBar._noteSprites);
        for (let i = 0; i < keys.length; i++) {
            const beatKey = keys[i];
            if (beatKey < currentBeat) {
                NoteBar._noteSprites[beatKey][0].destroy();
                NoteBar._noteSprites[beatKey][1].destroy();
                delete NoteBar._noteSprites[beatKey];
            }
        }

        for (let beat = currentBeatFloor + 1; beat < currentBeatFloor + 1 + 4; beat++) {
            if (NoteBar._noteSprites[beat]) {
                continue;
            }

            const leftSprite = new PIXI.Sprite(NoteBar.BOTTOM_NOTE_TEXTURE);
            leftSprite.anchor.x = 0.5;
            leftSprite.anchor.y = 0.5;
            leftSprite.alpha = 0;
            Renderer.staticContainer.addChild(leftSprite);

            const rightSprite = new PIXI.Sprite(NoteBar.BOTTOM_NOTE_TEXTURE);
            rightSprite.anchor.x = 0.5;
            rightSprite.anchor.y = 0.5;
            rightSprite.alpha = 0;
            Renderer.staticContainer.addChild(rightSprite);

            NoteBar._noteSprites[beat] = [leftSprite, rightSprite];
        }

        if (clientEntity && bpm) {
            for (const beatKey in NoteBar._noteSprites) {
                // maybe?
                const remainingBeatsUntilBeat = beatKey - currentBeat;
                const [leftSprite, rightSprite] = NoteBar._noteSprites[beatKey];

                leftSprite.position.x = window.innerWidth / 2 - remainingBeatsUntilBeat * 200;
                leftSprite.position.y = window.innerHeight - 48 - 30;
                leftSprite.alpha = Math.min(leftSprite.alpha + 0.001 * dt, 1);

                rightSprite.position.x = window.innerWidth / 2 + remainingBeatsUntilBeat * 200;
                rightSprite.position.y = window.innerHeight - 48 - 30;
                rightSprite.alpha = Math.min(leftSprite.alpha + 0.001 * dt, 1);
            }
        }
    }
}