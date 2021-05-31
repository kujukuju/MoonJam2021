class EnemyEntity extends Entity {
    _wandering;
    _positioning;
    _attacking;
    _retreating;

    _defaultPosition;

    _informFriends;
    _informFriendsCountdown;

    _offsetPosition;
    _offsetWanderCountdown;
    _holdWanderCountdown;

    _canAttack;
    _attackRetreatCountdown;

    _retreatAngle;
    _retreatCountdown;

    _beatAccel;

    _lastBeat = -1;

    _angle;

    constructor() {
        super();

        this._wandering = true;
        this._positioning = false;
        this._attacking = false;
        this._retreating = false;

        this._defaultPosition = null;

        this._informFriends = [];
        this._informFriendsCountdown = 0;

        this._offsetPosition = null;
        this._offsetWanderCountdown = 0;
        this._holdWanderCountdown = 0;

        this._canAttack = true;
        this._attackRetreatCountdown = 0;

        this._retreatAngle = 0;
        this._retreatCountdown = 0;

        this._beatAccel = [0, 0];

        this._lastBeat = -1;

        this._angle = 0;
    }

    update(time, dt) {
        super.update(time, dt);

        if (AbilityInformation.hasOsuAbility()) {
            return;
        }

        this._informFriendsCountdown = Math.max(this._informFriendsCountdown - dt, 0);
        if (this._informFriendsCountdown === 0 && this._informFriends.length > 0) {
            for (let i = 0; i < this._informFriends.length; i++) {
                this._informFriends[i].setFoundTarget();
            }

            this._informFriends = [];
        }

        this._holdWanderCountdown = Math.max(this._holdWanderCountdown - dt, 0);
        this._offsetWanderCountdown = Math.max(this._offsetWanderCountdown - dt, 0);
        this._attackRetreatCountdown = Math.max(this._attackRetreatCountdown - dt, 0);
        this._retreatCountdown = Math.max(this._retreatCountdown - dt, 0);

        if (this._wandering) {
            if (this._offsetPosition) {
                if (this._offsetWanderCountdown === 0) {
                    this._offsetPosition = null;
                    this._holdWanderCountdown = Math.random() * 600 + 200;
                } else {
                    const position = this.getPosition();
                    const delta = [this._offsetPosition[0] - position[0], this._offsetPosition[1] - position[1]];
                    const d2 = delta[0] * delta[0] + delta[1] * delta[1];

                    if (d2 < 10 * 10) {
                        this._offsetPosition = null;
                        this._holdWanderCountdown = Math.random() * 600 + 200;
                    }
                }
            }

            if (!this._offsetPosition && this._holdWanderCountdown === 0) {
                if (this._defaultPosition) {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = 400 + Math.sqrt(Math.random()) * 240;
                    this._offsetPosition = [Math.cos(angle) * radius, Math.sin(angle) * radius];
                    this._offsetWanderCountdown = Math.random() * 400 + 400;
                }
            }

            // search for the enemy
            let found = false;
            const potentialEntities = EntityInformation.getEntities(this.getPosition(), 900);
            for (let i = 0; i < potentialEntities.length; i++) {
                const entity = potentialEntities[i];
                if (entity instanceof MoonEntity) {
                    const moonPosition = entity.getPosition();
                    // aggro is LoS
                    if (LevelManager.level.canTraceLine(this._position, moonPosition)) {
                        found = true;
                        break;
                    }
                }
            }

            if (found) {
                this.setFoundTarget();
            }
        }

        if (this._positioning) {
            if (this._offsetPosition) {
                const position = this.getPosition();
                const targetPosition = EntityInformation.getClientEntity().getPosition();
                // const delta = [targetPosition[0] + this._offsetPosition[0] - position[0], targetPosition[1]  + this._offsetPosition[1] - position[1]];
                // const d2 = delta[0] * delta[0] + delta[1] * delta[1];

                const targetDelta = [targetPosition[0] - position[0], targetPosition[1] - position[1]];
                const targetRadius = MathHelper.magnitude(targetDelta);

                // weird logic to account for the fact that enemies can set their position to get near you, but not want to position there
                const offsetAngle = Math.atan2(this._offsetPosition[1], this._offsetPosition[0]);
                const testPosition = [
                    targetPosition[0] + Math.cos(offsetAngle) * targetRadius,
                    targetPosition[1] + Math.sin(offsetAngle) * targetRadius,
                ];
                const testDelta = [
                    testPosition[0] - position[0],
                    testPosition[1] - position[1],
                ];
                const testD2 = testDelta[0] * testDelta[0] + testDelta[1] * testDelta[1];

                if (testD2 < this.getValidPositioningRadius() * this.getValidPositioningRadius()) {
                    this._offsetPosition = null;

                    if (Math.random() < this.getAttackChance()) {
                        this.setAttacking();
                    }
                }
            }

            if (!this._offsetPosition) {
                const angle = Math.random() * Math.PI * 2;
                const radius = 400 + Math.sqrt(Math.random()) * 240;
                this._offsetPosition = [Math.cos(angle) * radius, Math.sin(angle) * radius];
            }
        }

        if (this._attacking) {
            if (this._attackRetreatCountdown === 0 && !this._canAttack) {
                const targetPosition = EntityInformation.getClientEntity().getPosition();
                const position = this.getPosition();
                const delta = [targetPosition[0] - position[0], targetPosition[1] - position[1]];

                this._retreatAngle = Math.atan2(-delta[1], -delta[0]) + Math.PI * Math.random() - Math.PI / 2;
                this._retreatCountdown = 2000;

                this.setRetreating();
            } else if (this._canAttack) {
                const targetPosition = EntityInformation.getClientEntity().getPosition();
                const position = this.getPosition();
                const delta = [targetPosition[0] - position[0], targetPosition[1] - position[1]];
                const d2 = delta[0] * delta[0] + delta[1] * delta[1];

                const radius = EntityInformation.getClientEntity().getRadius() + this.getRadius();
                if (d2 < radius * radius && MusicManager.isOnBeat(time)) {
                    this._angle = Math.atan2(delta[1], delta[0]);

                    // TODO I'm worried that enemies might attack too fast upon getting to moon, I might need a delay or something?

                    this.attack();

                    this._attackRetreatCountdown = 400;
                    this._canAttack = false;
                }
            }
        }

        if (this._retreating) {
            this._canAttack = true;

            if (this._retreatCountdown === 0) {
                this.setFoundTarget();
            }
        }

        const floorBeat = Math.floor(this._getRelativeBeat(time));
        if (this._lastBeat !== floorBeat) {
            this._lastBeat = floorBeat;
            this._beatAccel = this._calculateBeatAccel();
        }
    }

    setPosition(x, y) {
        super.setPosition(x, y);

        if (!this._defaultPosition) {
            this._defaultPosition = [x, y];
        }
    }

    setFoundTarget() {
        this._wandering = false;
        this._positioning = true;
        this._attacking = false;
        this._retreating = false;

        const potentialEntities = EntityInformation.getEntities(this.getPosition(), 600);
        for (let i = 0; i < potentialEntities.length; i++) {
            if (potentialEntities[i] === this) {
                continue;
            }

            if (potentialEntities[i] instanceof EnemyEntity) {
                this._informFriends.push(potentialEntities[i]);
            }
        }

        this._informFriendsCountdown = 1000;
    }

    setAttacking() {
        this._wandering = false;
        this._positioning = false;
        this._attacking = true;
        this._retreating = false;

        AbilityInformation.addAbility(new AlertAbility(this));
    }

    setRetreating() {
        this._wandering = false;
        this._positioning = false;
        this._attacking = false;
        this._retreating = true;
    }

    attack() {
        throw 'You must override the attack method.';
    }

    getAngle() {
        return this._angle;
    }

    getAttackChance() {
        return 0.5;
    }

    getValidPositioningRadius() {
        return 80;
    }

    kill() {
        super.kill();

        ChargeManager.addPerfect();
    }

    _calculateBeatAccel() {
        if (this._wandering) {
            if (!this._defaultPosition) {
                return [0, 0];
            }

            if (!this._offsetPosition) {
                return [0, 0];
            }

            const desired = [
                this._defaultPosition[0] + this._offsetPosition[0],
                this._defaultPosition[1] + this._offsetPosition[1],
            ];

            const vec = [desired[0] - this._position[0], desired[1] - this._position[1]];
            const length = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
            if (length > 0) {
                vec[0] /= length;
                vec[1] /= length;
            }

            this._angle = Math.atan2(vec[1], vec[0]);

            return vec;
        }
        if (this._positioning) {
            if (!this._offsetPosition) {
                return [0, 0];
            }

            const targetPos = EntityInformation.getClientEntity().getPosition();
            const desired = [
                targetPos[0] + this._offsetPosition[0],
                targetPos[1] + this._offsetPosition[1],
            ];

            const vec = [desired[0] - this._position[0], desired[1] - this._position[1]];
            const length = MathHelper.magnitude(vec);
            if (length > 0) {
                vec[0] /= length;
                vec[1] /= length;
            }

            const targetDelta = [
                targetPos[0] - this._position[0],
                targetPos[1] - this._position[1],
            ];
            const MAX = Math.PI / 2 * 0.6;
            const desiredAngle = Math.atan2(vec[1], vec[0]);
            const maxCWAngle = Math.atan2(targetDelta[1], targetDelta[0]) + MAX;
            const deltaCWAngle = MathHelper.radiansBetweenAngles(desiredAngle, maxCWAngle);
            if (deltaCWAngle > 0 && deltaCWAngle <= MAX) {
                vec[0] = Math.cos(maxCWAngle);
                vec[1] = Math.sin(maxCWAngle);
            }

            const maxCCWAngle = Math.atan2(targetDelta[1], targetDelta[0]) - MAX;
            const deltaCWWAngle = MathHelper.radiansBetweenAngles(desiredAngle, maxCCWAngle);
            if (deltaCWWAngle < 0 && deltaCWWAngle >= -MAX) {
                vec[0] = Math.cos(maxCCWAngle);
                vec[1] = Math.sin(maxCCWAngle);
            }

            this._angle = Math.atan2(vec[1], vec[0]);

            return vec;
        }
        if (this._attacking) {
            if (this._attackRetreatCountdown > 0) {
                return [0, 0];
            }

            const targetPos = EntityInformation.getClientEntity().getPosition();
            const vec = [targetPos[0] - this._position[0], targetPos[1] - this._position[1]];
            const length = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
            if (length > 0) {
                vec[0] /= length;
                vec[1] /= length;
            }

            this._angle = Math.atan2(vec[1], vec[0]);

            return vec;
        }
        if (this._retreating) {
            this._angle = this._retreatAngle;

            return [Math.cos(this._retreatAngle), Math.sin(this._retreatAngle)];
        }

        return [0, 0];
    }

    _getRelativeBeat(time) {
        return MusicManager.getCurrentBeat(time);
    }

    _getAccel() {
        return this._beatAccel;
    }

    _getMaxSpeed() {
        if (this._wandering) {
            return Entity.MAX_SPEED / 2;
        }

        return Entity.MAX_SPEED * 1.4;
    }
}