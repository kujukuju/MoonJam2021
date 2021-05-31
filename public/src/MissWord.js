class MissWord extends Ability {
    static TEXTURE = PIXI.Texture.from('assets/miss.png');

    static MISS1 = new Howl({src: 'assets/Sounds/miss1.mp3', volume: 0.6 * MusicConstants.BASE});
    static MISS2 = new Howl({src: 'assets/Sounds/miss2.mp3', volume: 0.6 * MusicConstants.BASE});

    static EASE_IN_DURATION = 200;
    static LIFETIME = 400;
    static EASE_OUT_DURATION = 800;
    // static SCALE_DURATION = 400;

    _sprite;
    _deltaTime;
    _angle;
    _startPositionY;

    constructor(position) {
        super();

        this._angle = -Math.PI / 2 + (Math.random() * 2 - 1) * Math.PI / 8;
        this._startPositionY = position[1] + Math.sin(this._angle) * 80 - 240;

        this._sprite = new PIXI.Sprite(MissWord.TEXTURE);
        this._sprite.position.x = position[0] + Math.cos(this._angle) * 80;
        this._sprite.position.y = this._startPositionY;
        this._sprite.anchor.x = 0.5;
        this._sprite.anchor.y = 0.5;
        this._sprite.scale.x = 0;
        this._sprite.scale.y = 0;
        this._sprite.visible = false;
        Renderer.container.addChild(this._sprite);

        this._deltaTime = 0;

        if (Math.random() < 0.5) {
            MissWord.MISS1.play();
        } else {
            MissWord.MISS2.play();
        }

        // ChargeManager.consumeUltCharge();
        // ChargeManager.consumeGunCharge();
        // ChargeManager.consumeDashCharge();
    }

    update(time, dt) {
        if (this._deltaTime > MissWord.EASE_IN_DURATION + MissWord.LIFETIME + MissWord.EASE_OUT_DURATION) {
            this.destroy();
            return;
        }

        const verticalProgress = Math.min(this._deltaTime / (MissWord.EASE_IN_DURATION + MissWord.LIFETIME + MissWord.EASE_OUT_DURATION), 1);
        const verticalOffset = (1 - (verticalProgress - 0.25) * (verticalProgress - 0.25) * 4) - 0.75;
        const appliedVerticalOffset = Math.sin(this._angle) * verticalOffset * 100;

        this._sprite.position.x += Math.cos(this._angle) * 0.1 * dt;
        this._sprite.position.y = this._startPositionY + appliedVerticalOffset;
        this._sprite.rotation = this._angle + Math.PI / 2;
        this._sprite.visible = true;

        if (this._deltaTime < MissWord.EASE_IN_DURATION) {
            const easeInProgress = Math.min(this._deltaTime / MissWord.EASE_IN_DURATION, 1);
            const easedProgress = MathHelper.easeInOut(easeInProgress);
            this._sprite.alpha = easedProgress;
            this._sprite.scale.x = easedProgress * 1.5;
            this._sprite.scale.y = easedProgress * 1.5;
        } else if (this._deltaTime < MissWord.EASE_IN_DURATION + MissWord.LIFETIME) {
            this._sprite.alpha = 1;
            this._sprite.scale.x = 1.5;
            this._sprite.scale.y = 1.5;
        } else {
            const deltaTime = Math.max(this._deltaTime - (MissWord.EASE_IN_DURATION + MissWord.LIFETIME), 0);
            const easeOutProgress = Math.min(deltaTime / MissWord.EASE_OUT_DURATION, 1);
            const easedProgress = 1 - MathHelper.easeInOut(easeOutProgress);
            this._sprite.alpha = easedProgress;
            // this._sprite.scale.x = easedProgress;
            // this._sprite.scale.y = easedProgress;
        }

        this._deltaTime += dt;
    }

    destroy() {
        super.destroy();

        this._sprite.destroy();
    }
}