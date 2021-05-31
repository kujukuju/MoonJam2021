class BossBullet extends Ability {
    static HOWL = new Howl({src: 'assets/blood-bullet.mp3', volume: 0.7 * MusicConstants.BASE});

    static TEXTURE = PIXI.Texture.from('assets/blood-bullet-sheet.png');
    static TEXTURES = [
        new PIXI.Texture(BossBullet.TEXTURE, new PIXI.Rectangle(0, 0, 128, 64)),
        new PIXI.Texture(BossBullet.TEXTURE, new PIXI.Rectangle(128, 0, 128, 64)),
    ];
    static RADIUS = 4;

    _sprite;
    _deltaTime;

    _position;
    _previousPosition;

    _velocity;

    constructor(position, velocity) {
        super();

        this._sprite = new PIXI.AnimatedSprite(BossBullet.TEXTURES);
        this._sprite.autoUpdate = true;
        this._sprite.anchor.x = 0.5;
        this._sprite.anchor.y = 0.5;
        this._sprite.scale.x = 2;
        this._sprite.scale.y = 2;
        this._sprite.visible = false;
        this._sprite.loop = true;
        this._sprite.animationSpeed = 0.1;
        this._sprite.rotation = Math.atan2(velocity[1], velocity[0]);
        this._sprite.gotoAndPlay(0);
        Renderer.container.addChild(this._sprite);

        this._deltaTime = 0;
        this._position = [position[0], position[1]];
        this._previousPosition = [position[0], position[1]];

        this._velocity = velocity;

        const id = BossBullet.HOWL.play();
        AudioStuff.initialize3D(BossBullet.HOWL, id, position);
    }

    update(time, dt) {
        this._previousPosition[0] = this._position[0];
        this._previousPosition[1] = this._position[1];

        this._position[0] += this._velocity[0] * dt;
        this._position[1] += this._velocity[1] * dt;

        const vec = [
            this._position[0] - this._previousPosition[0],
            this._position[1] - this._previousPosition[1],
        ];
        const radius = MathHelper.magnitude(vec) / 2;
        const center = [
            this._previousPosition[0] + vec[0] / 2,
            this._previousPosition[1] + vec[1] / 2,
        ];

        const aabb = new box2d.b2AABB();
        aabb.lowerBound.x = Math.min(this._previousPosition[0], this._position[0]);
        aabb.lowerBound.y = Math.min(this._previousPosition[1], this._position[1]);
        aabb.upperBound.x = Math.max(this._previousPosition[0], this._position[0]);
        aabb.upperBound.y = Math.max(this._previousPosition[1], this._position[1]);

        const potentialWalls = LevelManager.level.getPotentialWalls(aabb);
        if (potentialWalls.length > 0) {
            const segment = [
                this._previousPosition,
                this._position,
            ];

            for (let i = 0; i < potentialWalls.length; i++) {
                const potential = potentialWalls[i];
                if (MathHelper.intersectLinePolygon(null, potential, segment)) {
                    // TODO play BossBullet hit wall noise here

                    this.destroy();
                    return;
                }
            }
        }

        const potentialEntities = EntityInformation.getEntities(center, radius + 100);
        if (potentialEntities.length > 0) {
            const segment = [
                this._previousPosition,
                this._position,
            ];

            for (let i = 0; i < potentialEntities.length; i++) {
                const potential = potentialEntities[i];
                if (potential instanceof BossEntity) {
                    continue;
                }

                const position = potential.getPosition();
                const allowedRadius = potential.getRadius() + BossBullet.RADIUS;
                const d2 = MathHelper.distanceSquaredToLine(position, segment);
                if (d2 <= allowedRadius * allowedRadius) {
                    potential.kill();

                    // TODO play BossBullet hit squishy entity here

                    // this code right here means it doesnt pierce
                    this.destroy();
                    return;
                }
            }
        }

        this._sprite.position.x = this._position[0];
        this._sprite.position.y = this._position[1] - Entity.VERTICAL_OFFSET;
        this._sprite.zIndex = this._position[1];
        this._sprite.visible = true;
    }

    destroy() {
        super.destroy();

        this._sprite.destroy();
    }
}