class Arrow extends Ability {
    static TEXTURE = PIXI.Texture.from('assets/arrow.png');

    _sprite;
    _deltaTime;

    constructor() {
        super();

        this._sprite = new PIXI.Sprite(Arrow.TEXTURE);
        this._sprite.anchor.x = 0.2;
        this._sprite.anchor.y = 0.5;
        this._sprite.scale.x = 1.4;
        this._sprite.scale.y = 1.4;
        this._sprite.visible = false;
        Renderer.arrowContainer.addChild(this._sprite);

        this._deltaTime = 0;
    }

    update(time, dt) {
        const owner = EntityInformation.getClientEntity();
        if (!owner) {
            this.destroy();
            return;
        }

        const ownerPosition = owner.getPosition();
        const ownerAngle = owner.getAngle();

        this._sprite.position.x = ownerPosition[0];
        this._sprite.position.y = ownerPosition[1];
        this._sprite.rotation = ownerAngle;
        this._sprite.visible = true;
    }

    destroy() {
        super.destroy();

        this._sprite.destroy();
    }
}