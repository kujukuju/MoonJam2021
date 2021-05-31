class SwordSwing extends Ability {
    static TEXTURE = PIXI.Texture.from('assets/sword-sheet2.png');
    static WIDTH = 256;
    static HEIGHT = 239;
    static TEXTURES = [
        new PIXI.Texture(SwordSwing.TEXTURE, new PIXI.Rectangle(0, 0, SwordSwing.WIDTH, SwordSwing.HEIGHT)),
        new PIXI.Texture(SwordSwing.TEXTURE, new PIXI.Rectangle(SwordSwing.WIDTH, 0, SwordSwing.WIDTH, SwordSwing.HEIGHT)),
        new PIXI.Texture(SwordSwing.TEXTURE, new PIXI.Rectangle(SwordSwing.WIDTH * 2, 0, SwordSwing.WIDTH, SwordSwing.HEIGHT)),
        new PIXI.Texture(SwordSwing.TEXTURE, new PIXI.Rectangle(SwordSwing.WIDTH * 3, 0, SwordSwing.WIDTH, SwordSwing.HEIGHT)),
        new PIXI.Texture(SwordSwing.TEXTURE, new PIXI.Rectangle(SwordSwing.WIDTH * 4, 0, SwordSwing.WIDTH, SwordSwing.HEIGHT)),
    ];

    static SWING_NOISE = new Howl({src: 'assets/sword-swing.mp3', volume: 0.6 * MusicConstants.BASE});
    static HIT_NOISE = new Howl({src: 'assets/maybe-hit.mp3', volume: 0.6 * MusicConstants.BASE});

    static DURATION = 400;

    static ANCHOR = [1 / SwordSwing.WIDTH, 125 / SwordSwing.HEIGHT];

    static POLYGON = [
        [(4 - SwordSwing.ANCHOR[0] * SwordSwing.WIDTH) * 1.2, (124 - SwordSwing.ANCHOR[1] * SwordSwing.HEIGHT) * 1.2],
        [(45 - SwordSwing.ANCHOR[0] * SwordSwing.WIDTH) * 1.2, (222 - SwordSwing.ANCHOR[1] * SwordSwing.HEIGHT) * 1.2],
        [(132 - SwordSwing.ANCHOR[0] * SwordSwing.WIDTH) * 1.2, (230 - SwordSwing.ANCHOR[1] * SwordSwing.HEIGHT) * 1.2],
        [(126 - SwordSwing.ANCHOR[0] * SwordSwing.WIDTH) * 1.2, (216 - SwordSwing.ANCHOR[1] * SwordSwing.HEIGHT) * 1.2],
        [(217 - SwordSwing.ANCHOR[0] * SwordSwing.WIDTH) * 1.2, (123 - SwordSwing.ANCHOR[1] * SwordSwing.HEIGHT) * 1.2],
        [(184 - SwordSwing.ANCHOR[0] * SwordSwing.WIDTH) * 1.2, (31 - SwordSwing.ANCHOR[1] * SwordSwing.HEIGHT) * 1.2],
    ];

    _sprite;
    _deltaTime;

    constructor() {
        super();

        this._sprite = new PIXI.AnimatedSprite(SwordSwing.TEXTURES);
        this._sprite.autoUpdate = false;
        this._sprite.loop = false;
        this._sprite.anchor.x = SwordSwing.ANCHOR[0];
        this._sprite.anchor.y = SwordSwing.ANCHOR[1];
        this._sprite.scale.x = 1;
        this._sprite.scale.y = 1;
        this._sprite.visible = false;
        Renderer.container.addChild(this._sprite);

        const id = SwordSwing.SWING_NOISE.play();
        AudioStuff.initialize3D(SwordSwing.HIT_NOISE, id, EntityInformation.getClientEntity().getPosition());

        this._deltaTime = 0;
    }

    update(time, dt) {
        this._deltaTime += dt;

        const owner = EntityInformation.getClientEntity();
        if (!owner) {
            this.destroy();
            return;
        }

        if (this._deltaTime < 100) {
            owner.forceSwordStage(0);
        } else {
            owner.forceSwordStage(1);
        }

        const ownerPosition = owner.getPosition();

        const progress = Math.min(this._deltaTime / SwordSwing.DURATION, 1);
        const frame = Math.min(Math.floor(progress * this._sprite.textures.length), this._sprite.textures.length - 1);
        this._sprite.gotoAndStop(frame);
        this._sprite.visible = true;
        this._sprite.position.x = ownerPosition[0] + Math.cos(owner.getAngle()) * owner.getRadius();
        this._sprite.position.y = ownerPosition[1] - Entity.VERTICAL_OFFSET + Math.sin(owner.getAngle()) * owner.getRadius();
        this._sprite.zIndex = ownerPosition[1] + Math.sin(owner.getAngle()) * owner.getRadius();
        this._sprite.rotation = owner.getAngle();

        const polygon = SwordSwing.POLYGON.map(point => {
            const rotated = MathHelper.rotatePoint(point, owner.getAngle());
            return [ownerPosition[0] + rotated[0], ownerPosition[1] + rotated[1]];
        });

        let hit = false;
        // handle polygon collisions, 1 sec coffee
        const potentialEntities = EntityInformation.getEntities(ownerPosition, 300);
        for (let i = 0; i < potentialEntities.length; i++) {
            const entity = potentialEntities[i];
            if (entity === owner) {
                continue;
            }

            // cant kill behind walls
            if (!LevelManager.level.canTraceLine(ownerPosition, entity.getPosition())) {
                continue;
            }

            if (MathHelper.polygonEntityCollision(entity, polygon)) {
                hit = true;
                entity.kill();
            }
        }

        // if (hit) {
        //     const id = SwordSwing.HIT_NOISE.play();
        //     AudioStuff.initialize3D(SwordSwing.HIT_NOISE, id, ownerPosition);
        // }

        if (this._deltaTime > SwordSwing.DURATION) {
            this.destroy();
        }
    }

    destroy() {
        super.destroy();

        this._sprite.destroy();
    }
}