class Punishment extends Ability {
    _deltaTime;
    _duration;

    constructor(duration) {
        super();

        this._deltaTime = 0;
        this._duration = duration;
    }

    update(time, dt) {
        const owner = EntityInformation.getClientEntity();
        if (!owner) {
            this.destroy();
            return;
        }

        owner.setForcedAccelMul(0);

        if (this._deltaTime > this._duration) {
            this.destroy();
        }

        this._deltaTime += dt;
    }
}