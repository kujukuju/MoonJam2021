class Dash extends Ability {
    _deltaTime;
    _duration;

    constructor(duration) {
        super();

        this._deltaTime = 0;
        this._duration = duration / 2;

        ChargeManager.consumeDashCharge();
    }

    update(time, dt) {
        const owner = EntityInformation.getClientEntity();
        if (!owner) {
            this.destroy();
            return;
        }

        owner.setForcedMusicValueOverride(1);
        owner.setForcedMaxSpeedMul(2);

        const desiredSpeed = Entity.MAX_SPEED * 2;
        const velocity = owner.getVelocity();
        const speed = MathHelper.magnitude(velocity);
        if (speed > 0) {
            const newSpeed = Math.min(speed + dt * 0.001, desiredSpeed);
            const newVelocity = [
                velocity[0] / speed * newSpeed,
                velocity[1] / speed * newSpeed,
            ];
            owner.setVelocity(newVelocity[0], newVelocity[1]);
        }

        if (this._deltaTime > this._duration) {
            this.destroy();
        }

        this._deltaTime += dt;
    }
}