class Bullet extends Ability {
    static TEXTURE = PIXI.Texture.from('assets/bullet.png');
    static RADIUS = 96;

    _sprite;
    _deltaTime;

    _position;
    _previousPosition;

    _velocity;

    constructor(position, velocity) {
        super();

        this._sprite = new PIXI.Sprite(Bullet.TEXTURE);
        this._sprite.anchor.x = 0.5;
        this._sprite.anchor.y = 0.5;
        this._sprite.scale.x = 2;
        this._sprite.scale.y = 2;
        this._sprite.visible = false;
        this._sprite.rotation = Math.atan2(velocity[1], velocity[0]);
        Renderer.container.addChild(this._sprite);

        this._deltaTime = 0;
        this._position = [position[0], position[1]];
        this._previousPosition = [position[0], position[1]];

        this._velocity = velocity;
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

        const potentialEntities = EntityInformation.getEntities(center, radius + 100);
        if (potentialEntities.length > 0) {
            const segment = [
                this._previousPosition,
                this._position,
            ];

            for (let i = 0; i < potentialEntities.length; i++) {
                const potential = potentialEntities[i];
                if (potential === EntityInformation.getClientEntity()) {
                    continue;
                }

                const position = potential.getPosition();
                const allowedRadius = potential.getRadius() + Bullet.RADIUS;
                const d2 = MathHelper.distanceSquaredToLine(position, segment);
                if (d2 <= allowedRadius * allowedRadius) {
                    potential.kill();

                    // TODO play bullet hit squishy entity here

                    // this code right here means it doesnt pierce
                    this.destroy();
                    return;
                }
            }
        }

        const potentialWalls = LevelManager.level.getPotentialWalls(aabb);
        if (potentialWalls.length > 0) {
            const segment = [
                this._previousPosition,
                this._position,
            ];

            for (let i = 0; i < potentialWalls.length; i++) {
                const potential = potentialWalls[i];
                if (MathHelper.intersectLinePolygon(null, potential, segment)) {
                    // TODO play bullet hit wall noise here

                    this.destroy();
                    return;
                }
            }
        }

        this._sprite.position.x = this._position[0];
        this._sprite.position.y = this._position[1] - Entity.VERTICAL_OFFSET;
        this._sprite.visible = true;
    }

    destroy() {
        super.destroy();

        this._sprite.destroy();
    }
}