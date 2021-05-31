class Camera {
    static DENSITY_MUL = 0.65;

    static _position = [0, 0];
    static _density = 1;

    static _forcedPosition = null;
    static _forcedDensity = null;

    static initialize() {
        const spawn = LevelManager.level.getSpawn(0);

        Camera._position[0] = spawn[0];
        Camera._position[1] = spawn[1];

        Howler.pos(Camera._position[0] / 500, Camera._position[1] / 500, 1);
    }

    static update(time, dt) {
        if (Camera._forcedPosition) {
            const clientEntity = EntityInformation.getClientEntity();
            if (clientEntity) {
                Camera._position[0] = Camera._forcedPosition[0];
                Camera._position[1] = Camera._forcedPosition[1];
            }
        } else {
            const clientEntity = EntityInformation.getClientEntity();
            if (clientEntity) {
                Camera._position[0] = clientEntity.getPosition()[0];
                Camera._position[1] = clientEntity.getPosition()[1];
            }
        }

        Howler.pos(Camera._position[0] / 500, Camera._position[1] / 500, 1);

        Camera._updateContainers();

        Camera._forcedPosition = null;
        Camera._forcedDensity = null;
    }

    static getPosition() {
        return Camera._position;
    }

    static forcePosition(position) {
        Camera._forcedPosition = [position[0], position[1]];
    }

    static forceDensity(density) {
        Camera._forcedDensity = density;
    }

    static getDensity() {
        if (Camera._forcedDensity !== null) {
            return Camera._forcedDensity;
        }

        return Camera._density;
    }

    static getAABB() {
        const density = Camera.getDensity() * Camera.DENSITY_MUL;
        const width = window.innerWidth / density;
        const height = window.innerHeight / density;

        return [
            [Camera._position[0] - width / 2, Camera._position[1] - height / 2],
            [Camera._position[0] + width / 2, Camera._position[1] + height / 2],
        ];
    }

    static convertToScreenSpace(position, forcedDensity) {
        const density = (forcedDensity ? forcedDensity : Camera.getDensity()) * Camera.DENSITY_MUL;

        const x = Camera._position[0] - window.innerWidth / 2 / density;
        const y = Camera._position[1] - window.innerHeight / 2 / density;

        return [
            (position[0] - x) * density,
            (position[1] - y) * density,
        ];
    }

    static getMouseWorldPosition() {
        const density = Camera.getDensity() * Camera.DENSITY_MUL;

        // top left corner in world space
        const x = Camera._position[0] - window.innerWidth / 2 / density;
        const y = Camera._position[1] - window.innerHeight / 2 / density;

        return [
            x + InputManager.mousePosition[0] / density,
            y + InputManager.mousePosition[1] / density,
        ];
    }

    setDensity(density) {
        Camera._density = density;
    }

    static _updateContainers() {
        const density = Camera.getDensity() * Camera.DENSITY_MUL;

        const x = -Camera._position[0] * density + window.innerWidth / 2;
        const y = -Camera._position[1] * density + window.innerHeight / 2;

        Renderer.backgroundContainer.position.x = x;
        Renderer.backgroundContainer.position.y = y;
        Renderer.levelShadowContainer.position.x = x;
        Renderer.levelShadowContainer.position.y = y;
        Renderer.boundaryContainer.position.x = x;
        Renderer.boundaryContainer.position.y = y;
        Renderer.shadowContainer.position.x = x;
        Renderer.shadowContainer.position.y = y;
        Renderer.enemyArrowContainer.position.x = x;
        Renderer.enemyArrowContainer.position.y = y;
        Renderer.arrowContainer.position.x = x;
        Renderer.arrowContainer.position.y = y;
        Renderer.deadBodyContainer.position.x = x;
        Renderer.deadBodyContainer.position.y = y;
        Renderer.container.position.x = x;
        Renderer.container.position.y = y;

        Renderer.backgroundContainer.scale.x = density;
        Renderer.backgroundContainer.scale.y = density;
        Renderer.levelShadowContainer.scale.x = density;
        Renderer.levelShadowContainer.scale.y = density;
        Renderer.boundaryContainer.scale.x = density;
        Renderer.boundaryContainer.scale.y = density;
        Renderer.shadowContainer.scale.x = density;
        Renderer.shadowContainer.scale.y = density;
        Renderer.enemyArrowContainer.scale.x = density;
        Renderer.enemyArrowContainer.scale.y = density;
        Renderer.arrowContainer.scale.x = density;
        Renderer.arrowContainer.scale.y = density;
        Renderer.deadBodyContainer.scale.x = density;
        Renderer.deadBodyContainer.scale.y = density;
        Renderer.container.scale.x = density;
        Renderer.container.scale.y = density;
    }
}