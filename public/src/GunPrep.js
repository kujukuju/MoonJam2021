class GunPrep extends Ability {
    static PREP1 = new Howl({src: 'assets/Sounds/cockgunprep.mp3', volume: 0.8 * MusicConstants.BASE});
    static GUNSHOT = new Howl({src: 'assets/Sounds/gun(withoutcock).mp3', volume: 0.6 * MusicConstants.BASE});

    _deltaTime;
    _duration;
    _firedBullet;

    constructor(duration) {
        super();

        this._deltaTime = 0;
        this._duration = duration;
        this._firedBullet = false;

        GunPrep.PREP1.play();

        ChargeManager.consumeGunCharge();
    }

    update(time, dt) {
        const owner = EntityInformation.getClientEntity();
        if (!owner) {
            this.destroy();
            return;
        }

        this._deltaTime += dt;

        if (this._deltaTime < this._duration / 2) {
            owner.forceGunStage(0);
        } else {
            owner.forceGunStage(1);
        }
        owner.setForcedMaxSpeedMul(0.5);

        if (this._deltaTime > this._duration && !this._firedBullet) {
            this._firedBullet = true;

            GunPrep.GUNSHOT.play();

            const ownerAngle = owner.getAngle();
            for (let i = 0; i < 7; i++) {
                const progress = i / 6;
                const angleOffset = (progress * 2 - 1) * Math.PI / 8;

                const velocity = [
                    Math.cos(ownerAngle + angleOffset) * 4,
                    Math.sin(ownerAngle + angleOffset) * 4,
                ];
                AbilityInformation.addAbility(new Bullet(owner.getPosition(), velocity));
            }
        }

        if (this._deltaTime > this._duration) {
            this.destroy();
        }
    }
}