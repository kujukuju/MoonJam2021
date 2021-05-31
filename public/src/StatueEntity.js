class StatueEntity extends EnemyEntity {
    static TEXTURE = PIXI.Texture.from('assets/GARGOYLE.png');

    static ANCHOR = [
        106 / 500,
        408 / 445,
    ];

    _sprite;

    constructor() {
        super();

        this._sprite = new PIXI.Sprite(StatueEntity.TEXTURE);
        this._sprite.anchor.x = StatueEntity.ANCHOR[0];
        this._sprite.anchor.y = StatueEntity.ANCHOR[1];
        this._sprite.anchor.x = 0.5;
        this._sprite.anchor.y = 1;
        this._sprite.visible = false;
        this._sprite.alpha = 0;
        Renderer.container.addChild(this._sprite);

        this._shadowSprite.scale.x = 1.4;
        this._shadowSprite.scale.y = 1.4;
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
    }

    setHidden() {
        this._sprite.visible = false;
        this._shadowSprite.visible = false;
    }

    setVisible() {
        this._sprite.visible = true;
        this._shadowSprite.visible = true;
    }

    forceFrame(frame) {

    }

    getRadius() {
        return 80;
    }

    getHeight() {
        return 422 * 0.5;
    }

    attack() {
        // do damage, make noise
        AbilityInformation.addAbility(new BatBite(this));
    }

    kill(gun) {
        super.kill(gun);

        const id = Entity.HUMANOID_HIT.play();
        AudioStuff.initialize3D(Entity.HUMANOID_HIT, id, this._position);
        // TODO position this sound

        AbilityInformation.addAbility(new DeadAbility(this, DeadAbility.STATUE_TEXTURE));
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

    _getMaxSpeed() {
        return Entity.MAX_SPEED * this._forcedMaxSpeedMul * 1.25;
    }

    _getRelativeBeat(time) {
        return MusicManager.getCurrentEventBeat(time, 'lead3');
    }

    _getBeatDuration(time) {
        const beat = this._getRelativeBeat(time);
        return MusicManager.getEventDuration(Math.round(beat), 'lead3');
    }

    _getApproximateBeatTime(beat) {
        return MusicManager.getApproximateTimeForEvent(Math.round(beat), 'lead3');
    }

    _getNextBeatTimeAfterTime(time) {
        return MusicManager.getEventTimeAfterTime(time, 'lead3');
    }

    // _getRelativeBeat(time) {
    //     return MusicManager.getCurrentBeat(time);
    //     // return MusicManager.getCurrentEventBeat(time, 'bat');
    // }
    //
    // _getBeatDuration(time) {
    //     return MusicManager.convertBeatToMilliseconds(1);
    //
    //     // const beat = this._getRelativeBeat(time);
    //     // return MusicManager.getEventDuration(Math.round(beat), 'bat');
    // }
    //
    // _getApproximateBeatTime(beat) {
    //     return MusicManager.getApproximateBeatTime(beat);
    // }
}