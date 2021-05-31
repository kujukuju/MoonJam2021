class BossText extends Ability {
    static WELCOME_TEXTURE = PIXI.Texture.from('assets/welcome-text.png');
    static IMMORTAL_TEXTURE = PIXI.Texture.from('assets/immortal-text.png');
    static WHEN_LEARN_TEXTURE = PIXI.Texture.from('assets/when-learn.png');
    static CURSE_YOU_TEXTURE = PIXI.Texture.from('assets/curse-you.png');

    static DURATION = 4000;

    _sprite;
    _deltaTime;

    _owner;
    _duration;

    constructor(owner, texture) {
        super();

        this._owner = owner;

        this._sprite = new PIXI.Sprite(texture);
        this._sprite.anchor.x = 0.5;
        this._sprite.anchor.y = 1;
        this._sprite.alpha = 0;
        this._sprite.visible = false;
        Renderer.container.addChild(this._sprite);

        this._deltaTime = 0;
        this._duration = BossText.DURATION;
    }

    update(time, dt) {
        this._deltaTime += dt;

        if (this._owner.isDead() && this._duration === BossText.DURATION) {
            this._deltaTime = BossText.DURATION + 1;
        }

        const position = this._owner.getPosition();
        const height = this._owner.getHeight();

        this._sprite.position.x = position[0];
        this._sprite.position.y = position[1] - height;
        this._sprite.zIndex = position[1];
        this._sprite.visible = true;

        if (this._deltaTime > this._duration) {
            this._sprite.alpha = Math.max(this._sprite.alpha - 0.001 * dt, 0);
        } else {
            this._sprite.alpha = Math.min(this._sprite.alpha + 0.01 * dt, 1);
        }

        if (this._sprite.alpha === 0) {
            this.destroy();
        }
    }

    forceDuration(duration) {
        this._duration = duration;
    }

    destroy() {
        super.destroy();

        this._sprite.destroy();
    }
}