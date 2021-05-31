class BatBite extends Ability {
    static TEXTURE = PIXI.Texture.from('assets/BAT BITE SHEET.png');
    static WIDTH = 128;
    static HEIGHT = 128;
    static TEXTURES = [
        new PIXI.Texture(BatBite.TEXTURE, new PIXI.Rectangle(0, 0, BatBite.WIDTH, BatBite.HEIGHT)),
        new PIXI.Texture(BatBite.TEXTURE, new PIXI.Rectangle(BatBite.WIDTH, 0, BatBite.WIDTH, BatBite.HEIGHT)),
        new PIXI.Texture(BatBite.TEXTURE, new PIXI.Rectangle(BatBite.WIDTH * 2, 0, BatBite.WIDTH, BatBite.HEIGHT)),
        new PIXI.Texture(BatBite.TEXTURE, new PIXI.Rectangle(BatBite.WIDTH * 3, 0, BatBite.WIDTH, BatBite.HEIGHT)),
        new PIXI.Texture(BatBite.TEXTURE, new PIXI.Rectangle(BatBite.WIDTH * 4, 0, BatBite.WIDTH, BatBite.HEIGHT)),
        new PIXI.Texture(BatBite.TEXTURE, new PIXI.Rectangle(BatBite.WIDTH * 5, 0, BatBite.WIDTH, BatBite.HEIGHT)),
        new PIXI.Texture(BatBite.TEXTURE, new PIXI.Rectangle(BatBite.WIDTH * 6, 0, BatBite.WIDTH, BatBite.HEIGHT)),
    ];

    static ANCHOR = [0, 0.5];
    static POLYGON = [
        [3 - BatBite.ANCHOR[0] * BatBite.WIDTH, 94 - BatBite.ANCHOR[1] * BatBite.HEIGHT],
        [62 - BatBite.ANCHOR[0] * BatBite.WIDTH, 106 - BatBite.ANCHOR[1] * BatBite.HEIGHT],
        [76 - BatBite.ANCHOR[0] * BatBite.WIDTH, 64 - BatBite.ANCHOR[1] * BatBite.HEIGHT],
        [67 - BatBite.ANCHOR[0] * BatBite.WIDTH, 28 - BatBite.ANCHOR[1] * BatBite.HEIGHT],
        [2 - BatBite.ANCHOR[0] * BatBite.WIDTH, 55 - BatBite.ANCHOR[1] * BatBite.HEIGHT],
    ];

    static DURATION = 400;

    _owner;

    _sprite;
    _deltaTime;

    constructor(owner) {
        super();

        this._owner = owner;

        this._sprite = new PIXI.AnimatedSprite(BatBite.TEXTURES);
        this._sprite.autoUpdate = false;
        this._sprite.loop = false;
        this._sprite.anchor.x = BatBite.ANCHOR[0];
        this._sprite.anchor.y = BatBite.ANCHOR[1];
        this._sprite.scale.x = 1;
        this._sprite.scale.y = 1;
        this._sprite.visible = false;
        Renderer.container.addChild(this._sprite);

        this._deltaTime = 0;
    }

    update(time, dt) {
        this._deltaTime += dt;

        const ownerPosition = this._owner.getPosition();

        const progress = Math.min(this._deltaTime / BatBite.DURATION, 1);
        const frame = Math.min(Math.floor(progress * this._sprite.textures.length), this._sprite.textures.length - 1);
        this._sprite.gotoAndStop(frame);
        this._sprite.visible = true;
        this._sprite.position.x = ownerPosition[0] + Math.cos(this._owner.getAngle()) * this._owner.getRadius();
        this._sprite.position.y = ownerPosition[1] - Entity.VERTICAL_OFFSET + Math.sin(this._owner.getAngle()) * this._owner.getRadius();
        this._sprite.zIndex = ownerPosition[1] + Math.sin(this._owner.getAngle()) * this._owner.getRadius();
        this._sprite.rotation = this._owner.getAngle();

        const polygon = BatBite.POLYGON.map(point => {
            const rotated = MathHelper.rotatePoint(point, this._owner.getAngle());
            return [ownerPosition[0] + rotated[0], ownerPosition[1] + rotated[1]];
        });

        const potentialEntities = EntityInformation.getEntities(ownerPosition, 200);
        for (let i = 0; i < potentialEntities.length; i++) {
            const entity = potentialEntities[i];
            if (entity === this._owner) {
                continue;
            }

            if (MathHelper.polygonEntityCollision(entity, polygon)) {
                entity.kill();
            }
        }

        if (this._deltaTime > BatBite.DURATION) {
            this.destroy();
        }
    }

    destroy() {
        super.destroy();

        this._sprite.destroy();
    }
}