class Loop {
    static _lastTime = 0;

    static initialize() {
        window.requestAnimationFrame(Loop.loop);
    }

    static loop() {
        const time = Date.now();
        if (!Loop._lastTime) {
            Loop._lastTime = time;
        }

        const dt = time - Loop._lastTime;
        LogicLoop.update(time, dt);
        Loop._lastTime = time;

        window.requestAnimationFrame(Loop.loop);
    }
}