class ZombieBite extends Ability {
    static TEXTURE = PIXI.Texture.from('assets/bat-bite-sheet.png');
    static WIDTH = 128;
    static HEIGHT = 128;
    static TEXTURES = [
        new PIXI.Texture(ZombieBite.TEXTURE, new PIXI.Rectangle(0, 0, ZombieBite.WIDTH, ZombieBite.HEIGHT)),
        new PIXI.Texture(ZombieBite.TEXTURE, new PIXI.Rectangle(ZombieBite.WIDTH, 0, ZombieBite.WIDTH, ZombieBite.HEIGHT)),
        new PIXI.Texture(ZombieBite.TEXTURE, new PIXI.Rectangle(ZombieBite.WIDTH * 2, 0, ZombieBite.WIDTH, ZombieBite.HEIGHT)),
        new PIXI.Texture(ZombieBite.TEXTURE, new PIXI.Rectangle(ZombieBite.WIDTH * 3, 0, ZombieBite.WIDTH, ZombieBite.HEIGHT)),
        new PIXI.Texture(ZombieBite.TEXTURE, new PIXI.Rectangle(ZombieBite.WIDTH * 4, 0, ZombieBite.WIDTH, ZombieBite.HEIGHT)),
        new PIXI.Texture(ZombieBite.TEXTURE, new PIXI.Rectangle(ZombieBite.WIDTH * 5, 0, ZombieBite.WIDTH, ZombieBite.HEIGHT)),
        new PIXI.Texture(ZombieBite.TEXTURE, new PIXI.Rectangle(ZombieBite.WIDTH * 6, 0, ZombieBite.WIDTH, ZombieBite.HEIGHT)),
    ];

    static ANCHOR = [0, 0.5];
    static POLYGON = [
        [3 - ZombieBite.ANCHOR[0] * ZombieBite.WIDTH, 94 - ZombieBite.ANCHOR[1] * ZombieBite.HEIGHT],
        [62 - ZombieBite.ANCHOR[0] * ZombieBite.WIDTH, 106 - ZombieBite.ANCHOR[1] * ZombieBite.HEIGHT],
        [76 - ZombieBite.ANCHOR[0] * ZombieBite.WIDTH, 64 - ZombieBite.ANCHOR[1] * ZombieBite.HEIGHT],
        [67 - ZombieBite.ANCHOR[0] * ZombieBite.WIDTH, 28 - ZombieBite.ANCHOR[1] * ZombieBite.HEIGHT],
        [2 - ZombieBite.ANCHOR[0] * ZombieBite.WIDTH, 55 - ZombieBite.ANCHOR[1] * ZombieBite.HEIGHT],
    ];

    static DURATION = 400;

    _owner;

    _sprite;
    _deltaTime;

    constructor(owner) {
        super();

        this._owner = owner;

        this._sprite = new PIXI.AnimatedSprite(ZombieBite.TEXTURES);
        this._sprite.autoUpdate = false;
        this._sprite.loop = false;
        this._sprite.anchor.x = ZombieBite.ANCHOR[0];
        this._sprite.anchor.y = ZombieBite.ANCHOR[1];
        this._sprite.scale.x = 1;
        this._sprite.scale.y = 1;
        this._sprite.visible = false;
        Renderer.container.addChild(this._sprite);

        this._deltaTime = 0;
    }

    update(time, dt) {
        this._deltaTime += dt;

        const ownerPosition = this._owner.getPosition();
        if (this._deltaTime < ZombieBite.DURATION / 2) {
            this._owner.forceFrame(4);
        } else {
            this._owner.forceFrame(5);
        }

        const progress = Math.min(this._deltaTime / ZombieBite.DURATION, 1);
        const frame = Math.min(Math.floor(progress * this._sprite.textures.length), this._sprite.textures.length - 1);
        this._sprite.gotoAndStop(frame);
        this._sprite.visible = true;
        this._sprite.position.x = ownerPosition[0] + Math.cos(this._owner.getAngle()) * this._owner.getRadius();
        this._sprite.position.y = ownerPosition[1] - this._owner.getRadius() * 2 + Math.sin(this._owner.getAngle()) * this._owner.getRadius();
        this._sprite.rotation = this._owner.getAngle();

        const polygon = ZombieBite.POLYGON.map(point => {
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

        if (this._deltaTime > ZombieBite.DURATION) {
            this.destroy();
        }
    }

    destroy() {
        super.destroy();

        this._sprite.destroy();
    }
}