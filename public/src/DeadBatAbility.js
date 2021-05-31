class DeadBatAbility extends Ability {
    static TEXTURE = PIXI.Texture.from('assets/dead-bat.png');

    _sprite;
    _deltaTime;

    // the dead bad ability where it lies dead on the ground
    constructor(entity) {
        super();

        this._sprite = new PIXI.Sprite(DeadBatAbility.TEXTURE);
        this._sprite.anchor.x = 0.5;
        this._sprite.anchor.y = 0.5;
        this._sprite.position.x = entity.getPosition()[0];
        this._sprite.position.y = entity.getPosition()[1];
        Renderer.deadBodyContainer.addChild(this._sprite);

        this._deltaTime = 0;
    }

    update(time, dt) {
        this._deltaTime += dt;

        if (this._deltaTime > 30000) {
            this._sprite.alpha = Math.max(this._sprite.alpha - dt * 0.0001, 0);
        }

        if (this._sprite.alpha === 0) {
            this.destroy();
        }
    }

    destroy() {
        super.destroy();

        this._sprite.destroy();
    }
}