class DeadAbility extends Ability {
    static BAT_TEXTURE = PIXI.Texture.from('assets/BAT SPRITE DEATH.png');
    static GHOUL_TEXTURE = PIXI.Texture.from('assets/GHOUL SPRITE DEATH.png');
    static ZOMBIE_TEXTURE = PIXI.Texture.from('assets/ZOMBIE SPRITE DEATH.png');

    _sprite;
    _deltaTime;

    // the dead bad ability where it lies dead on the ground
    constructor(entity, texture) {
        super();

        this._sprite = new PIXI.Sprite(texture);
        this._sprite.anchor.x = 0.5;
        this._sprite.anchor.y = 0.5;
        this._sprite.position.x = entity.getPosition()[0];
        this._sprite.position.y = entity.getPosition()[1];
        Renderer.deadBodyContainer.addChild(this._sprite);

        this._deltaTime = 0;
    }

    update(time, dt) {
        this._deltaTime += dt;

        if (this._deltaTime > 3000) {
            this._sprite.alpha = Math.max(this._sprite.alpha - dt * 0.001, 0);
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