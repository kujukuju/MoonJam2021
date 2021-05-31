class CoolMenuOverlayManager {
    static _sprite;

    static initialize() {
        CoolMenuOverlayManager._sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
        CoolMenuOverlayManager._sprite.alpha = 0.25;
        CoolMenuOverlayManager._sprite.width = window.innerWidth;
        CoolMenuOverlayManager._sprite.height = window.innerHeight;
        CoolMenuOverlayManager._sprite.tint = 0x000000;
        Renderer.staticContainer.addChild(CoolMenuOverlayManager._sprite);
    }

    static update(time, dt) {
        if (EntityInformation.getClientEntity()) {
            CoolMenuOverlayManager._sprite.alpha = Math.max(CoolMenuOverlayManager._sprite.alpha - 0.001 * dt, 0);
        }
    }
}