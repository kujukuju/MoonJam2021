class ParallaxManager {
    static TEXT = PIXI.Texture.from('assets/parallax.png');

    static _sprite;

    static initialize() {
        ParallaxManager._sprite = new PIXI.Sprite(ParallaxManager.TEXT);
        ParallaxManager._sprite.visible = false;
        ParallaxManager._sprite.anchor.x = 0.5;
        ParallaxManager._sprite.anchor.y = -0.4;
        Renderer.boundaryContainer.addChild(ParallaxManager._sprite);

        Renderer._application.renderer.plugins.prepare.upload(ParallaxManager._sprite, () => {});
    }

    static update(time, dt) {
        const room = StateManager.getCurrentRoom();
        ParallaxManager._sprite.visible = room >= 2;

        const cityPos = [2580.00, 11660.00];
        const center = [2764.00, 14740.00];

        const entity = EntityInformation.getClientEntity();
        if (!entity) {
            return;
        }

        const position = entity.getPosition();
        const delta = [
            position[0] - center[0],
            position[1] - center[1],
        ];
        delta[0] /= 2.5;
        delta[1] /= 2.5;

        ParallaxManager._sprite.position.x = cityPos[0] + delta[0];
        ParallaxManager._sprite.position.y = cityPos[1] + delta[1];
    }
}