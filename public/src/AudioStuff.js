class AudioStuff {
    static PANNER_ATTR = {
        // coneInnerAngle: 360,
        // coneOuterAngle: 360,
        // coneOuterGain: 0,
        // distanceModel: 'linear',
        // // maxDistance: 10000,
        // // panningModel: 'HRTF',
        // refDistance: 0,
        // rolloffFactor: 0,
        // maxDistance: 10000,
    };

    static initialize() {
        // -y forward z up
        Howler.orientation(0, Math.sqrt(2) / 2, -Math.sqrt(2) / 2, 0, 0, 1);
        Howler.pos(0, 0, 1);
    }

    static initialize3D(howl, id, position) {
        howl.pannerAttr(AudioStuff.PANNER_ATTR, id);

        const entity = EntityInformation.getClientEntity();
        if (entity) {
            const origin = entity.getPosition();
            const delta = [
                origin[0] - position[0],
                origin[1] - position[1],
            ];
            const length = MathHelper.magnitude(delta);
            if (length > 0) {
                delta[0] /= length;
                delta[1] /= length;
            }

            howl.orientation(-delta[0], delta[1], 0, id);
        }

        howl.pos(position[0] / 500, position[1] / 500, 0, id);
    }
}