class GhoulEntity extends EnemyEntity {
    static TEXTURE = PIXI.Texture.from('assets/ghoul-sheet.png');
    static TEXTURES = [
        new PIXI.Texture(GhoulEntity.TEXTURE, new PIXI.Rectangle(0, 0, 500, 445)),
        new PIXI.Texture(GhoulEntity.TEXTURE, new PIXI.Rectangle(500, 0, 500, 445)),
        new PIXI.Texture(GhoulEntity.TEXTURE, new PIXI.Rectangle(500 * 2, 0, 500, 445)),
        new PIXI.Texture(GhoulEntity.TEXTURE, new PIXI.Rectangle(500 * 3, 0, 500, 445)),
    ];

    static ANCHOR = [
        106 / 500,
        408 / 445,
    ];

    _sprite;

    _lastFrameBeat;
    _currentFrame;

    _forcedFrame;

    constructor() {
        super();

        this._sprite = new PIXI.AnimatedSprite(GhoulEntity.TEXTURES);
        this._sprite.anchor.x = GhoulEntity.ANCHOR[0];
        this._sprite.anchor.y = GhoulEntity.ANCHOR[1];
        this._sprite.scale.x = 0.8;
        this._sprite.scale.y = 0.8;
        this._sprite.visible = false;
        this._sprite.alpha = 0;
        this._sprite.gotoAndStop(0);
        Renderer.container.addChild(this._sprite);

        this._shadowSprite.scale.x = 1.4;
        this._shadowSprite.scale.y = 1.4;

        this._lastFrameBeat = 0;
        this._currentFrame = 0;

        this._forcedFrame = -1;
    }

    update(time, dt) {
        super.update(time, dt);

        this._sprite.position.x = this._position[0];
        // flying
        this._sprite.position.y = this._position[1];
        this._sprite.alpha = Math.min(this._sprite.alpha + 0.001 * dt, 1);
        this._sprite.zIndex = this._position[1];
        this._sprite.visible = true;

        this._shadowSprite.position.x = this._position[0];
        this._shadowSprite.position.y = this._position[1];
        this._shadowSprite.visible = true;

        if (this._velocity[0] < 0) {
            this._sprite.scale.x = -Math.abs(this._sprite.scale.x);
        } else if (this._velocity[0] > 0) {
            this._sprite.scale.x = Math.abs(this._sprite.scale.x);
        }

        const beat = Math.floor(this._getRelativeBeat(time));
        if (beat > this._lastFrameBeat) {
            this._lastFrameBeat = beat;

            this._currentFrame++;

            this._sprite.gotoAndStop(this._currentFrame % this._sprite.textures.length);
        }

        if (this._forcedFrame !== -1) {
            this._sprite.gotoAndStop(this._forcedFrame);
            this._forcedFrame = -1;
        }
    }

    forceFrame(frame) {
        this._forcedFrame = frame;
    }

    getRadius() {
        return 80;
    }

    getHeight() {
        return 422 * 0.8;
    }

    attack() {
        // do damage, make noise
        AbilityInformation.addAbility(new BatBite(this));
    }

    kill() {
        super.kill();

        AbilityInformation.addAbility(new DeadBatAbility(this));
    }

    getAttackChance() {
        return 1;
    }

    getValidPositioningRadius() {
        return 160;
    }

    destroy() {
        super.destroy();

        this._sprite.destroy();
    }

    _getRelativeBeat(time) {
        return MusicManager.getCurrentBeat(time);
        // return MusicManager.getCurrentEventBeat(time, 'bat');
    }

    _getBeatDuration(time) {
        return MusicManager.convertBeatToMilliseconds(1);

        // const beat = this._getRelativeBeat(time);
        // return MusicManager.getEventDuration(Math.round(beat), 'bat');
    }

    _getApproximateBeatTime(beat) {
        return MusicManager.getApproximateBeatTime(beat);
    }
}