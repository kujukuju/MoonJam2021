class AudioStuff {
    static PANNER_ATTR = {
        distanceModel: 'linear',
        refDistance: 100,
    };

    static initialize() {
        // y forward z up
        Howler.orientation(0, 1, 0, 0, 0, 1);
        Howler.pos(0, 0, 0);
    }

    static initialize3D(howl, id) {
        howl.pannerAttr(AudioStuff.PANNER_ATTR, id);
    }

    static setPosition(howl, id, x, y, z) {
        howl.pos(x, y, z, id);
    }
}