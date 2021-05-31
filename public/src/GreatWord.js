class GreatWord extends Ability {
    static TEXTURE = PIXI.Texture.from('assets/great.png');

    static EASE_IN_DURATION = 200;
    static LIFETIME = 400;
    static EASE_OUT_DURATION = 800;
    // static SCALE_DURATION = 400;

    _sprite;
    _deltaTime;
    _angle;

    constructor(position) {
        super();

        this._angle = -Math.PI / 2 + (Math.random() * 2 - 1) * Math.PI / 8;

        this._sprite = new PIXI.Sprite(GreatWord.TEXTURE);
        this._sprite.position.x = position[0] + Math.cos(this._angle) * 80;
        this._sprite.position.y = position[1] + Math.sin(this._angle) * 80 - 240;
        this._sprite.anchor.x = 0.5;
        this._sprite.anchor.y = 0.5;
        this._sprite.scale.x = 0;
        this._sprite.scale.y = 0;
        this._sprite.visible = false;
        this._sprite.zIndex = position[1];
        Renderer.container.addChild(this._sprite);

        this._deltaTime = 0;

        // PerfectWord.HIT.play();
    }

    update(time, dt) {
        if (this._deltaTime > GreatWord.EASE_IN_DURATION + GreatWord.LIFETIME + GreatWord.EASE_OUT_DURATION) {
            this.destroy();
            return;
        }

        this._sprite.position.x += Math.cos(this._angle) * 0.1 * dt;
        this._sprite.position.y += Math.sin(this._angle) * 0.1 * dt;
        this._sprite.rotation = this._angle + Math.PI / 2;
        this._sprite.visible = true;

        // const scaleProgress = Math.min(this._deltaTime / GreatWord.SCALE_DURATION, 1);
        // const scaleValue = MathHelper.bounce(scaleProgress);
        // this._sprite.scale.x = scaleValue * 2;
        // this._sprite.scale.y = scaleValue * 2;

        if (this._deltaTime < GreatWord.EASE_IN_DURATION) {
            const easeInProgress = Math.min(this._deltaTime / GreatWord.EASE_IN_DURATION, 1);
            const easedProgress = MathHelper.easeInOut(easeInProgress);
            this._sprite.alpha = easedProgress;
            this._sprite.scale.x = easedProgress * 2;
            this._sprite.scale.y = easedProgress * 2;
        } else if (this._deltaTime < GreatWord.EASE_IN_DURATION + GreatWord.LIFETIME) {
            this._sprite.alpha = 1;
            this._sprite.scale.x = 2;
            this._sprite.scale.y = 2;
        } else {
            const deltaTime = Math.max(this._deltaTime - (GreatWord.EASE_IN_DURATION + GreatWord.LIFETIME), 0);
            const easeOutProgress = Math.min(deltaTime / GreatWord.EASE_OUT_DURATION, 1);
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