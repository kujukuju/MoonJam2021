class LevelManager {
    static level;

    static initialize() {
        LevelManager.level = new Level();
    }

    static update(time, dt) {
        if (LevelManager.level) {
            LevelManager.level.update(time, dt);
        }
    }
}