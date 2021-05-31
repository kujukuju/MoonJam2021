class Entity {
    static SHADOW_TEXTURE = PIXI.Texture.from('assets/shadow.png');
    static VERTICAL_OFFSET = 140;

    static HUMANOID_HIT = new Howl({src: 'assets/humanoid-hit.mp3', volume: 0.5 * MusicConstants.BASE});
    static BAT_HIT = new Howl({src: 'assets/bat-hit.mp3', volume: 0.7 * MusicConstants.BASE});

    // these values are now percentages of max speed, I think
    static ACCEL = 0.05;
    static FRICTION = 0.05;

    static MAX_SPEED = 1.5;

    static _nextEntityID = 1;

    _entityID;
    _position;
    _velocity;

    _polygon;
    _aabb;

    _remainingBeatDeltaBeats;
    _lastBeat;

    _shadowSprite;

    _forcedAccelMul;
    _forcedMusicValueOverride;
    _forcedMaxSpeedMul;

    _forcedImmortalUntil;

    constructor() {
        this._entityID = Entity._getNextEntityID();

        this._position = [0, 0];
        this._velocity = [0, 0];

        this._polygon = new Array(24);
        this._aabb = new box2d.b2AABB();
        for (let i = 0; i < this._polygon.length; i++) {
            this._polygon[i] = [0, 0];
        }

        this._remainingBeatDeltaBeats = 0;
        this._lastBeat = 0;

        this._shadowSprite = new PIXI.Sprite(Entity.SHADOW_TEXTURE);
        this._shadowSprite.anchor.x = 0.5;
        this._shadowSprite.anchor.y = 0.5;
        this._shadowSprite.scale.x = 0.8;
        this._shadowSprite.scale.y = 0.8;
        this._shadowSprite.visible = false;
        this._shadowSprite.alpha = 0;
        Renderer.shadowContainer.addChild(this._shadowSprite);

        this._forcedAccelMul = 1;
        this._forcedMusicValueOverride = null;
        this._forcedMaxSpeedMul = 1;

        this._forcedImmortalUntil = 0;
    }

    update(time, dt) {
        const beat = this._getRelativeBeat(time);
        const beatInteger = Math.round(beat);

        const MS_TO_BEAT = 125 / 60000;

        this._shadowSprite.alpha = Math.min(this._shadowSprite.alpha + 0.0005 * dt, 0.5);

        const deltaBeat = beat - this._lastBeat;
        // const deltaBeat = Math.pow(beat - this._lastBeat, 8) / 8;
        // const deltaBeat = Math.pow(beat - this._lastBeat, 1 / 16) / 32;
        this._lastBeat = beat;
        if (Math.abs(beat - beatInteger) < 40 * MS_TO_BEAT) {
            this._remainingBeatDeltaBeats = 200 * MS_TO_BEAT;
        }

        // dt = (deltaBeat / MS_TO_BEAT + dt * 1) / 2;

        // const beatDuration = this._getBeatDuration(time);
        const beatDuration = Math.pow(this._getBeatDuration(time), 1.05) * (480 / 653);
        const beatMilliseconds = MusicManager.convertBeatToMilliseconds(1);
        const beatScale = beatMilliseconds ? (beatDuration / MusicManager.convertBeatToMilliseconds(1)) : 1;

        this._remainingBeatDeltaBeats = Math.max(this._remainingBeatDeltaBeats - deltaBeat, 0);

        const accel = this._getAccel();
        {
            const accelLength = MathHelper.magnitude(accel);
            if (accelLength > 0) {
                const musicValue = MusicManager.getBeatTimeModifier(beat);
                accel[0] /= accelLength;
                accel[1] /= accelLength;
                if (this._forcedMusicValueOverride === null) {
                    accel[0] *= musicValue;
                    accel[1] *= musicValue;
                } else {
                    accel[0] *= this._forcedMusicValueOverride;
                    accel[1] *= this._forcedMusicValueOverride;
                    this._forcedMusicValueOverride = null;
                }
                accel[0] *= beatScale;
                accel[1] *= beatScale;
                accel[0] *= this._forcedAccelMul;
                accel[1] *= this._forcedAccelMul;
                this._forcedAccelMul = 1;
            }
        }

        const accelLength = MathHelper.magnitude(accel) * this._remainingBeatDeltaBeats;
        // const frictionLength = 1 - accelLength;
        const frictionLength = 1;

        // FRICTION NOT ACCEL
        // I need more physics stuff here too
        if (accelLength === 0) {
            const preFrictionSpeed = MathHelper.magnitude(this._velocity);
            if (preFrictionSpeed > 0) {
                if (preFrictionSpeed < Entity.FRICTION * dt * frictionLength * this._getMaxSpeed()) {
                    // if speed to small its 0
                    this._velocity[0] = 0;
                    this._velocity[1] = 0;
                } else {
                    const newFrictionSpeed = preFrictionSpeed - Entity.FRICTION * dt * frictionLength * this._getMaxSpeed();
                    this._velocity[0] /= preFrictionSpeed;
                    this._velocity[1] /= preFrictionSpeed;
                    this._velocity[0] *= newFrictionSpeed;
                    this._velocity[1] *= newFrictionSpeed;
                }
            }
        }

        // accel
        const preSpeed = MathHelper.magnitude(this._velocity);
        const velocity = [
            this._velocity[0],
            this._velocity[1],
        ];
        velocity[0] += accel[0] * Entity.ACCEL * dt * this._getMaxSpeed();
        velocity[1] += accel[1] * Entity.ACCEL * dt * this._getMaxSpeed();
        const postSpeed = MathHelper.magnitude(velocity);

        const maxSpeed = this._getMaxSpeed();
        if (preSpeed < maxSpeed) {
            if (postSpeed < maxSpeed) {
                this._velocity[0] = velocity[0];
                this._velocity[1] = velocity[1];
            } else {
                if (postSpeed > 0) {
                    this._velocity[0] = velocity[0] / postSpeed * maxSpeed;
                    this._velocity[1] = velocity[1] / postSpeed * maxSpeed;
                } else {
                    this._velocity[0] = 0;
                    this._velocity[1] = 0;
                }
            }
        } else {
            if (postSpeed > 0) {
                this._velocity[0] = velocity[0] / postSpeed * maxSpeed;
                this._velocity[1] = velocity[1] / postSpeed * maxSpeed;
            } else {
                this._velocity[0] = 0;
                this._velocity[1] = 0;
            }
        }

        this._position[0] += this._velocity[0] * dt;
        this._position[1] += this._velocity[1] * dt;

        this._updatePolygon();

        // TODO aabb if the game is laggy
        const maxUpdates = 4;
        let updates = 0;
        let hitWall = true;
        while (updates < maxUpdates && hitWall) {
            hitWall = false;

            const walls = LevelManager.level.getPotentialWalls(this._aabb);
            for (let i = 0; i < walls.length; i++) {
                const wall = walls[i];

                const offset = MathHelper.resolvePolygonPolygonCollision(wall, this._polygon);
                if (offset) {
                    this._position[0] += offset[0];
                    this._position[1] += offset[1];
                    hitWall = true;

                    this._updatePolygon();
                }
            }

            updates++;
        }

        this._forcedMaxSpeedMul = 1;
    }

    setHidden() {
        throw 'You must override the setHidden method.';
    }

    setVisible() {
        throw 'You must override the setVisible method.';
    }

    getEntityID() {
        return this._entityID;
    }

    getPosition() {
        return this._position;
    }

    setPosition(x, y) {
        this._position[0] = x;
        this._position[1] = y;
    }

    getVelocity() {
        return this._velocity;
    }

    setVelocity(x, y) {
        this._velocity[0] = x;
        this._velocity[1] = y;
    }

    setForcedMusicValueOverride(value) {
        this._forcedMusicValueOverride = value;
    }

    setForcedAccelMul(mul) {
        this._forcedAccelMul = mul;
    }

    setForcedMaxSpeedMul(mul) {
        this._forcedMaxSpeedMul = mul;
    }

    setForcedImmortalUntil(time) {
        this._forcedImmortalUntil = time;
    }

    getRadius() {
        throw 'You must override the Entity getRadius method.';
    }

    getHeight() {
        return Entity.VERTICAL_OFFSET + 40;
    }

    kill() {
        if (Date.now() <= this._forcedImmortalUntil) {
            return;
        }

        this.destroy();

        const heartDead = new HeartDead();
        heartDead.setPosition(this._position[0], this._position[1]);
        AbilityInformation.addAbility(heartDead);
    }

    destroy() {
        this._shadowSprite.destroy();

        EntityInformation.removeEntity(this);
    }

    // this method returns the float beat value that this entity moves with
    _getRelativeBeat() {
        throw 'You must override _getRelativeBeat.';
    }

    _getBeatDuration(time) {
        return MusicManager.convertBeatToMilliseconds(1);
    }

    _getApproximateBeatTime(beat) {
        return MusicManager.getApproximateBeatTime(beat);
    }

    _getAccel() {
        throw 'You must override _getAccel.';
    }

    _updatePolygon() {
        for (let i = 0; i < this._polygon.length; i++) {
            // ccw winding poly
            const angle = -i / this._polygon.length * Math.PI * 2;
            this._polygon[i][0] = this._position[0] + Math.cos(angle) * this.getRadius();
            this._polygon[i][1] = this._position[1] + Math.sin(angle) * this.getRadius();
        }

        this._aabb = MathHelper.createAABBFromPolygon(this._polygon, 40);
    }

    _getMaxSpeed() {
        return Entity.MAX_SPEED * this._forcedMaxSpeedMul;
    }

    static _getNextEntityID() {
        return Entity._nextEntityID++;
    }
}