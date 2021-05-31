class GroundRenderer {
    static TEXTURE = PIXI.Texture.from('assets/GRASS_TEXT.png');

    static _repeatingSprite;

    static initialize() {
        GroundRenderer._repeatingSprite = new PIXI.TilingSprite(GroundRenderer.TEXTURE);
        GroundRenderer._repeatingSprite.visible = false;
        Renderer.backgroundContainer.addChild(GroundRenderer._repeatingSprite);
    }

    static update(time, dt) {
        const cameraAABB = Camera.getAABB();
        const cameraPosition = Camera.getPosition();

        const cameraCenter = [
            (cameraAABB[0][0] + cameraAABB[1][0]) / 2,
            (cameraAABB[0][1] + cameraAABB[1][1]) / 2,
        ];
        const cameraDimensions = [
            (cameraAABB[1][0] - cameraAABB[0][0]),
            (cameraAABB[1][1] - cameraAABB[0][1]),
        ];

        GroundRenderer._repeatingSprite.visible = true;
        GroundRenderer._repeatingSprite.position.x = cameraCenter[0] - cameraDimensions[0];
        GroundRenderer._repeatingSprite.position.y = cameraCenter[1] - cameraDimensions[1];
        GroundRenderer._repeatingSprite.width = cameraDimensions[0] * 2;
        GroundRenderer._repeatingSprite.height = cameraDimensions[1] * 2;
        GroundRenderer._repeatingSprite.tilePosition.x = -cameraPosition[0];
        GroundRenderer._repeatingSprite.tilePosition.y = -cameraPosition[1];
    }
}