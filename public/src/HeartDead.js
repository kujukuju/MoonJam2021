class HeartDead extends Ability {
    static TEXTURE = PIXI.Texture.from('assets/heart-dead.png');
    static TEXTURES = [
        new PIXI.Texture(HeartDead.TEXTURE, new PIXI.Rectangle(0, 0, 64, 64)),
        new PIXI.Texture(HeartDead.TEXTURE, new PIXI.Rectangle(64, 0, 64, 64)),
        new PIXI.Texture(HeartDead.TEXTURE, new PIXI.Rectangle(64 * 2, 0, 64, 64)),
        new PIXI.Texture(HeartDead.TEXTURE, new PIXI.Rectangle(64 * 3, 0, 64, 64)),
        new PIXI.Texture(HeartDead.TEXTURE, new PIXI.Rectangle(64 * 4, 0, 64, 64)),
        new PIXI.Texture(HeartDead.TEXTURE, new PIXI.Rectangle(64 * 5, 0, 64, 64)),
    ];

    static ANIM_DURATION = 800;
    static DURATION = 2400;

    _sprite;
    _deltaTime;

    constructor() {
        super();

        this._sprite = new PIXI.AnimatedSprite(HeartDead.TEXTURES);
        this._sprite.autoUpdate = false;
        this._sprite.loop = false;
        this._sprite.anchor.x = 0.5;
        this._sprite.anchor.y = 1;
        this._sprite.scale.x = 4;
        this._sprite.scale.y = 4;
        this._sprite.visible = false;
        Renderer.container.addChild(this._sprite);

        this._deltaTime = 0;
    }

    update(time, dt) {
        this._deltaTime += dt;

        const progress = Math.min(this._deltaTime / HeartDead.ANIM_DURATION, 1);
        const frame = Math.min(Math.floor(progress * this._sprite.textures.length), this._sprite.textures.length - 1);
        this._sprite.gotoAndStop(frame);
        this._sprite.visible = true;

        if (this._deltaTime > HeartDead.DURATION) {
            this.destroy();
        }
    }

    setPosition(x, y) {
        this._sprite.position.x = x;
        this._sprite.position.y = y - 80;
    }

    destroy() {
        super.destroy();

        this._sprite.destroy();
    }
}