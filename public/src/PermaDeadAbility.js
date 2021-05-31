class PermaDeadAbility extends Ability {
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

    }

    destroy() {
        super.destroy();

        this._sprite.destroy();
    }
}