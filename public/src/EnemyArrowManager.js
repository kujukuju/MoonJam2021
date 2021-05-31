class EnemyArrowManager {
    static ARROW_TEX = PIXI.Texture.from('assets/enemy-arrow.png');

    static _arrowSprites = [];

    static initialize() {
        for (let i = 0; i < 16; i++) {
            const sprite = new PIXI.Sprite(EnemyArrowManager.ARROW_TEX);
            EnemyArrowManager._arrowSprites.push(sprite);
            sprite.alpha = 0;
            sprite.visible = false;
            sprite.anchor.y = 0.5;
            Renderer.enemyArrowContainer.addChild(sprite);
        }
    }

    static update(time, dt) {
        const cameraAABB = Camera.getAABB();

        EnemyArrowManager._hideAllArrows();

        const clientEntity = EntityInformation.getClientEntity();
        if (!clientEntity) {
            return;
        }

        const clientPosition = clientEntity.getPosition();

        const entities = EntityInformation.getEntityList();
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            if (entity === EntityInformation.getClientEntity()) {
                continue;
            }

            // we don't show arrows if theres an entity on screen
            const position = entity.getPosition();
            if (MathHelper.isPointInAABB(position, cameraAABB)) {
                return;
            }
        }

        let currentIndex = 0;
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            if (entity === EntityInformation.getClientEntity()) {
                continue;
            }

            const position = entity.getPosition();
            const atan2 = Math.atan2(position[1] - clientPosition[1], position[0] - clientPosition[0]);

            const sprite = EnemyArrowManager._arrowSprites[currentIndex];
            sprite.rotation = atan2;
            sprite.position.x = clientPosition[0] + Math.cos(atan2) * 160;
            sprite.position.y = clientPosition[1] + Math.sin(atan2) * 160;
            sprite.alpha = Math.min(sprite.alpha + 0.02, 1);
            sprite.visible = true;

            currentIndex++;

            if (currentIndex >= EnemyArrowManager._arrowSprites.length) {
                return;
            }
        }
    }

    static _hideAllArrows() {
        for (let i = 0; i < EnemyArrowManager._arrowSprites.length; i++) {
            EnemyArrowManager._arrowSprites[i].visible = false;
            EnemyArrowManager._arrowSprites[i].alpha = Math.max(EnemyArrowManager._arrowSprites[i].alpha - 0.01, 0);
        }
    }
}