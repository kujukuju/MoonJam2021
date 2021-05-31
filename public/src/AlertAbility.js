class AlertAbility extends Ability {
    static TEXTURE = PIXI.Texture.from('assets/alert-sheet.png');
    static TEXTURES = [
        new PIXI.Texture(AlertAbility.TEXTURE, new PIXI.Rectangle(0, 0, 200, 200)),
        new PIXI.Texture(AlertAbility.TEXTURE, new PIXI.Rectangle(200, 0, 200, 200)),
        new PIXI.Texture(AlertAbility.TEXTURE, new PIXI.Rectangle(200 * 2, 0, 200, 200)),
        new PIXI.Texture(AlertAbility.TEXTURE, new PIXI.Rectangle(200 * 3, 0, 200, 200)),
        new PIXI.Texture(AlertAbility.TEXTURE, new PIXI.Rectangle(200 * 4, 0, 200, 200)),
    ];

    static ANIMATION_DURATION = 400;
    static DURATION = 1500;

    _sprite;
    _owner;
    _deltaTime;

    // the dead bad ability where it lies dead on the ground
    constructor(entity) {
        super();

        this._owner = entity;

        this._sprite = new PIXI.AnimatedSprite(AlertAbility.TEXTURES);
        this._sprite.anchor.x = 0.5;
        this._sprite.anchor.y = 1;
        this._sprite.position.x = entity.getPosition()[0];
        this._sprite.position.y = entity.getPosition()[1] - entity.getHeight();
        this._sprite.autoUpdate = false;
        Renderer.container.addChild(this._sprite);

        // probably an indicator I need to stop soon... this bug was simple as fuck
        this._deltaTime = 0;
    }

    update(time, dt) {
        const ownerPosition = this._owner.getPosition();
        this._sprite.position.x = ownerPosition[0];
        this._sprite.position.y = ownerPosition[1] - this._owner.getHeight();
        this._sprite.zIndex = ownerPosition[1];

        const progress = Math.min(this._deltaTime / AlertAbility.ANIMATION_DURATION, 1);
        const frame = Math.min(Math.floor(progress * this._sprite.textures.length), this._sprite.textures.length - 1);
        this._sprite.gotoAndStop(frame);

        if (this._deltaTime >= AlertAbility.DURATION) {
            this._sprite.alpha = Math.max(this._sprite.alpha - dt * 0.004, 0);

            if (this._sprite.alpha === 0) {
                this.destroy();
            }
        }

        this._deltaTime += dt;
    }

    destroy() {
        super.destroy();

        this._sprite.destroy();
    }
}