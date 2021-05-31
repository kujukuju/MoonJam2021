class MoonEntity extends Entity {
    static TEXTURE = PIXI.Texture.from('assets/moon-sheet.png');
    static TEXTURES = [
        new PIXI.Texture(MoonEntity.TEXTURE, new PIXI.Rectangle(0, 0, 343, 427)),
        new PIXI.Texture(MoonEntity.TEXTURE, new PIXI.Rectangle(343, 0, 343, 427)),
        new PIXI.Texture(MoonEntity.TEXTURE, new PIXI.Rectangle(343 * 2, 0, 343, 427)),
        new PIXI.Texture(MoonEntity.TEXTURE, new PIXI.Rectangle(343 * 3, 0, 343, 427)),
        new PIXI.Texture(MoonEntity.TEXTURE, new PIXI.Rectangle(343 * 4, 0, 343, 427)),
        new PIXI.Texture(MoonEntity.TEXTURE, new PIXI.Rectangle(343 * 5, 0, 343, 427)),
        new PIXI.Texture(MoonEntity.TEXTURE, new PIXI.Rectangle(343 * 6, 0, 343, 427)),
        new PIXI.Texture(MoonEntity.TEXTURE, new PIXI.Rectangle(343 * 7, 0, 343, 427)),
    ];

    static ANCHOR = [244 / 343, 394 / 427];

    static ANGLE_SPEED = Math.PI * 0.004;

    _sprite;

    _lastInteractionBeat;
    // _mouseDownLeft;

    _angle;

    _walkingProgress;
    _forcedSwordStage;
    _forcedGunStage;

    constructor() {
        super();

        this._sprite = new PIXI.AnimatedSprite(MoonEntity.TEXTURES);
        this._sprite.anchor.x = MoonEntity.ANCHOR[0];
        this._sprite.anchor.y = MoonEntity.ANCHOR[1];
        this._sprite.scale.x = 0.85;
        this._sprite.scale.y = 0.85;
        this._sprite.visible = false;
        Renderer.container.addChild(this._sprite);

        this._shadowSprite.scale.x = 1.2;
        this._shadowSprite.scale.y = 1.2;
        this._shadowSprite.alpha = 0.5;

        this._lastInteractionBeat = 0;
        // this._mouseDownLeft = false;

        AbilityInformation.addAbility(new Arrow());

        this._angle = 0;

        this._walkingProgress = 0;
        this._forcedSwordStage = -1;
        this._forcedGunStage = -1;
    }

    update(time, dt) {
        super.update(time, dt);

        this._sprite.position.x = this._position[0];
        this._sprite.position.y = this._position[1];
        this._sprite.zIndex = this._position[1];
        this._sprite.visible = true;

        this._shadowSprite.position.x = this._position[0];
        this._shadowSprite.position.y = this._position[1];
        this._shadowSprite.visible = true;

        if (this._velocity[0] < 0) {
            this._sprite.scale.x = Math.abs(this._sprite.scale.x);
        } else if (this._velocity[0] > 0) {
            this._sprite.scale.x = -Math.abs(this._sprite.scale.x);
        } else {
            if (Math.cos(this._angle) < 0) {
                this._sprite.scale.x = Math.abs(this._sprite.scale.x);
            } else if (Math.cos(this._angle) > 0) {
                this._sprite.scale.x = -Math.abs(this._sprite.scale.x);
            }
        }

        const mousePosition = Camera.getMouseWorldPosition();
        const mouseDelta = [
            mousePosition[0] - this._position[0],
            (mousePosition[1] + Entity.VERTICAL_OFFSET / 2) - this._position[1],
        ];
        const angle = Math.atan2(mouseDelta[1], mouseDelta[0]);

        const angleDelta = MathHelper.radiansBetweenAngles(this._angle, angle);
        if (Math.abs(angleDelta) < MoonEntity.ANGLE_SPEED * dt) {
            this._angle = angle;
        } else {
            if (angleDelta !== 0) {
                this._angle += Math.sign(angleDelta) * MoonEntity.ANGLE_SPEED * dt;
            }
        }

        if (!AbilityInformation.hasOsuAbility() && BossManager.canUseAbilities()) {
            const currentBeat = this._getRelativeBeat(time);
            const currentRoundedBeat = Math.round(this._getRelativeBeat(time));

            if (InputManager.mouseDownLeft && this._lastInteractionBeat < currentRoundedBeat) {
                this._lastInteractionBeat = currentRoundedBeat;

                if (MusicManager.isOnBeat(time)) {
                    AbilityInformation.addAbility(new SwordSwing());

                    const incorrectPercent = MusicManager.getPercentIncorrectBeat(currentBeat);
                    if (incorrectPercent < 0.2) {
                        // perfect
                        AbilityInformation.addAbility(new PerfectWord(this._position));
                    } else if (incorrectPercent < 0.6) {
                        AbilityInformation.addAbility(new GreatWord(this._position));
                    } else {
                        AbilityInformation.addAbility(new GoodWord(this._position));
                    }
                } else {
                    const beatRemainder = MusicManager.convertBeatToMilliseconds(Math.ceil(currentBeat) - currentBeat) + MusicManager.getMSPerBeat();

                    AbilityInformation.addAbility(new MissWord(this._position));
                    AbilityInformation.addAbility(new Punishment(beatRemainder));
                }
            }

            if (InputManager.mouseDownRight && this._lastInteractionBeat < currentRoundedBeat && ChargeManager.canGun()) {
                this._lastInteractionBeat = currentRoundedBeat;

                if (MusicManager.isOnBeat(time)) {
                    AbilityInformation.addAbility(new GunPrep(MusicManager.getMSPerBeat()));

                    const incorrectPercent = MusicManager.getPercentIncorrectBeat(currentBeat);
                    if (incorrectPercent < 0.2) {
                        // perfect
                        AbilityInformation.addAbility(new PerfectWord(this._position));
                    } else if (incorrectPercent < 0.6) {
                        AbilityInformation.addAbility(new GreatWord(this._position));
                    } else {
                        AbilityInformation.addAbility(new GoodWord(this._position));
                    }
                } else {
                    const beatRemainder = MusicManager.convertBeatToMilliseconds(Math.ceil(currentBeat) - currentBeat) + MusicManager.getMSPerBeat();

                    AbilityInformation.addAbility(new MissWord(this._position));
                    AbilityInformation.addAbility(new Punishment(beatRemainder));
                }
            }

            if (EntityInformation.getEntityCount() > 1) {
                if (InputManager.keys[' '] && this._lastInteractionBeat < currentRoundedBeat && ChargeManager.canUlt()) {
                    this._lastInteractionBeat = currentRoundedBeat;

                    if (MusicManager.isOnBeat(time)) {
                        AbilityInformation.addAbility(new Osu(time, MusicManager.getMSPerBeat()));

                        const incorrectPercent = MusicManager.getPercentIncorrectBeat(currentBeat);
                        if (incorrectPercent < 0.2) {
                            // perfect
                            AbilityInformation.addAbility(new PerfectWord(this._position));
                        } else if (incorrectPercent < 0.6) {
                            AbilityInformation.addAbility(new GreatWord(this._position));
                        } else {
                            AbilityInformation.addAbility(new GoodWord(this._position));
                        }
                    } else {
                        const beatRemainder = MusicManager.convertBeatToMilliseconds(Math.ceil(currentBeat) - currentBeat) + MusicManager.getMSPerBeat();

                        AbilityInformation.addAbility(new MissWord(this._position));
                        AbilityInformation.addAbility(new Punishment(beatRemainder));
                    }
                }
            }

            // allowed to use even if enemies are dead
            if (InputManager.keys['shift'] && this._lastInteractionBeat < currentRoundedBeat && ChargeManager.canDash()) {
                this._lastInteractionBeat = currentRoundedBeat;

                if (MusicManager.isOnBeat(time)) {
                    AbilityInformation.addAbility(new Dash(MusicManager.getMSPerBeat()));

                    const incorrectPercent = MusicManager.getPercentIncorrectBeat(currentBeat);
                    if (incorrectPercent < 0.2) {
                        // perfect
                        AbilityInformation.addAbility(new PerfectWord(this._position));
                    } else if (incorrectPercent < 0.6) {
                        AbilityInformation.addAbility(new GreatWord(this._position));
                    } else {
                        AbilityInformation.addAbility(new GoodWord(this._position));
                    }
                } else {
                    const beatRemainder = MusicManager.convertBeatToMilliseconds(Math.ceil(currentBeat) - currentBeat) + MusicManager.getMSPerBeat();

                    AbilityInformation.addAbility(new MissWord(this._position));
                    AbilityInformation.addAbility(new Punishment(beatRemainder));
                }
            }
        }

        const speed = MathHelper.magnitude(this._velocity);
        this._walkingProgress += speed * dt / 1000;
        this._walkingProgress = this._walkingProgress % 1;

        if (this._forcedGunStage !== -1) {
            this._playGunStage(this._forcedGunStage);
        } else if (this._forcedSwordStage !== -1) {
            this._playSwordStage(this._forcedSwordStage);
        } else {
            this._playWalkCycle(this._walkingProgress);
        }

        this._forcedSwordStage = -1;
        this._forcedGunStage = -1;
    }

    setHidden() {
        this._sprite.visible = false;
        this._shadowSprite.visible = false;
    }

    setVisible() {
        this._sprite.visible = true;
        this._shadowSprite.visible = true;
    }

    forceSwordStage(stage) {
        this._forcedSwordStage = stage;
    }

    forceGunStage(stage) {
        this._forcedGunStage = stage;
    }

    clearMouseDown() {
        this._lastInteractionBeat = 0;
    }

    getAngle() {
        return this._angle;
    }

    getRadius() {
        return 40;
    }

    getHeight() {
        return 410 * 0.85;
    }

    kill() {
        super.kill();

        if (Date.now() <= this._forcedImmortalUntil) {
            return;
        }
        AbilityInformation.addAbility(new DeadAbility(this, DeadAbility.MOON_TEXTURE));
    }

    destroy() {
        super.destroy();

        this._sprite.destroy();
    }

    _getRelativeBeat(time) {
        return MusicManager.getCurrentBeat(time);
    }

    _getMaxSpeed() {
        if (StateManager.getCurrentRoom() === 3) {
            return Entity.MAX_SPEED / 2;
        }

        return Entity.MAX_SPEED * this._forcedMaxSpeedMul;
    }

    _playWalkCycle(percent) {
        const frame = Math.min(Math.floor(percent * 4), 3);
        this._sprite.gotoAndStop(frame);
    }

    _playGunStage(stage) {
        // stage 0 is loading
        // stage 1 is firing
        // stage 2 is waiting
        this._sprite.gotoAndStop(4 + stage);
    }

    _playSwordStage(stage) {
        // stage 0 is sword up???
        // stage 1 is sword swinging/down... which is also default
        this._sprite.gotoAndStop(6 + stage);
    }

    _getAccel() {
        const accel = [0, 0];
        if (InputManager.keys['w']) {
            accel[1] -= 1;
        }
        if (InputManager.keys['a']) {
            accel[0] -= 1;
        }
        if (InputManager.keys['s']) {
            accel[1] += 1;
        }
        if (InputManager.keys['d']) {
            accel[0] += 1;
        }

        const accelLength = MathHelper.magnitude(accel);
        if (accelLength > 0) {
            accel[0] /= accelLength;
            accel[1] /= accelLength;
        }

        return accel;
    }
}