class BatEntity extends EnemyEntity {
    static TEXTURE = PIXI.Texture.from('assets/bat-fly-sheet-2.png');
    static TEXTURES = [
        new PIXI.Texture(BatEntity.TEXTURE, new PIXI.Rectangle(0, 0, 196, 95)),
        new PIXI.Texture(BatEntity.TEXTURE, new PIXI.Rectangle(196, 0, 196, 95)),
    ];

    _sprite;

    _lastFrameBeat;
    _currentFrame;

    constructor() {
        super();

        this._sprite = new PIXI.AnimatedSprite(BatEntity.TEXTURES);
        this._sprite.anchor.x = 0.5;
        this._sprite.anchor.y = 0.9;
        this._sprite.scale.x = 1;
        this._sprite.scale.y = 1;
        this._sprite.visible = false;
        this._sprite.alpha = 0;
        this._sprite.gotoAndStop(0);
        Renderer.container.addChild(this._sprite);

        this._lastFrameBeat = 0;
        this._currentFrame = 0;
    }

    update(time, dt) {
        super.update(time, dt);

        this._sprite.position.x = this._position[0];
        // flying
        this._sprite.position.y = this._position[1] - Entity.VERTICAL_OFFSET;
        this._sprite.alpha = Math.min(this._sprite.alpha + 0.001 * dt, 1);
        this._sprite.zIndex = this._position[1];
        this._sprite.visible = true;

        this._shadowSprite.position.x = this._position[0];
        this._shadowSprite.position.y = this._position[1];
        this._shadowSprite.visible = true;

        // if (this._velocity[1] < 0) {
        //     this._sprite.scale.y = -Math.abs(this._sprite.scale.y);
        // } else {
        //     this._sprite.scale.y = Math.abs(this._sprite.scale.y);
        // }

        const beat = Math.floor(this._getRelativeBeat(time));
        if (beat > this._lastFrameBeat) {
            this._lastFrameBeat = beat;

            this._currentFrame++;

            this._sprite.gotoAndStop(this._currentFrame % this._sprite.textures.length);
        }
    }

    setHidden() {
        this._sprite.visible = false;
        this._shadowSprite.visible = false;
    }

    setVisible() {
        this._sprite.visible = true;
        this._shadowSprite.visible = true;
    }

    getRadius() {
        return 40;
    }

    attack() {
        // do damage, make noise
        AbilityInformation.addAbility(new BatBite(this));
    }

    kill() {
        super.kill();

        const id = Entity.BAT_HIT.play();
        AudioStuff.initialize3D(Entity.BAT_HIT, id, this._position);

        AbilityInformation.addAbility(new DeadAbility(this, DeadAbility.BAT_TEXTURE));
    }

    destroy() {
        super.destroy();

        this._sprite.destroy();
    }

    _getRelativeBeat(time) {
        return MusicManager.getCurrentEventBeat(time, 'bat');
    }

    _getBeatDuration(time) {
        const beat = this._getRelativeBeat(time);
        return MusicManager.getEventDuration(Math.round(beat), 'bat');
    }

    _getApproximateBeatTime(beat) {
        return MusicManager.getApproximateTimeForEvent(Math.round(beat), 'bat');
    }
}