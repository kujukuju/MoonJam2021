class GateManager {
    static GATE_1_TOP_TEXTURE = PIXI.Texture.from('assets/gate1-top-sheet.png');
    static GATE_1_TOP_TEXTURES = [
        new PIXI.Texture(GateManager.GATE_1_TOP_TEXTURE, new PIXI.Rectangle(0, 0, 564, 1489)),
        new PIXI.Texture(GateManager.GATE_1_TOP_TEXTURE, new PIXI.Rectangle(564, 0, 564, 1489)),
        new PIXI.Texture(GateManager.GATE_1_TOP_TEXTURE, new PIXI.Rectangle(564 * 2, 0, 564, 1489)),
        new PIXI.Texture(GateManager.GATE_1_TOP_TEXTURE, new PIXI.Rectangle(564 * 3, 0, 564, 1489)),
    ];
    static GATE_1_BOTTOM_TEXTURE = PIXI.Texture.from('assets/gate1-bottom-sheet.png');
    static GATE_1_BOTTOM_TEXTURES = [
        new PIXI.Texture(GateManager.GATE_1_BOTTOM_TEXTURE, new PIXI.Rectangle(0, 0, 564, 1489)),
        new PIXI.Texture(GateManager.GATE_1_BOTTOM_TEXTURE, new PIXI.Rectangle(564, 0, 564, 1489)),
        new PIXI.Texture(GateManager.GATE_1_BOTTOM_TEXTURE, new PIXI.Rectangle(564 * 2, 0, 564, 1489)),
        new PIXI.Texture(GateManager.GATE_1_BOTTOM_TEXTURE, new PIXI.Rectangle(564 * 3, 0, 564, 1489)),
    ];

    static GATE_HAS_OPENED_TEXTURE = PIXI.Texture.from('assets/gate-has-opened.png');

    static _gate1TopSprite;
    static _gate1BottomSprite;
    static _gateHasOpenedSprite;

    static _gateOpenedTextDeltaTime;

    static initialize() {
        GateManager._gate1TopSprite = new PIXI.AnimatedSprite(GateManager.GATE_1_TOP_TEXTURES);
        GateManager._gate1TopSprite.autoUpdate = true;
        GateManager._gate1TopSprite.position.x = 652;
        GateManager._gate1TopSprite.position.y = 148;
        GateManager._gate1TopSprite.zIndex = 148 + 575;
        GateManager._gate1TopSprite.loop = false;
        GateManager._gate1TopSprite.animationSpeed = 0.05;
        Renderer.container.addChild(GateManager._gate1TopSprite);

        GateManager._gate1BottomSprite = new PIXI.AnimatedSprite(GateManager.GATE_1_BOTTOM_TEXTURES);
        GateManager._gate1BottomSprite.autoUpdate = true;
        GateManager._gate1BottomSprite.position.x = 652;
        GateManager._gate1BottomSprite.position.y = 148;
        GateManager._gate1BottomSprite.zIndex = 148 + 1440;
        GateManager._gate1BottomSprite.loop = false;
        GateManager._gate1BottomSprite.animationSpeed = 0.05;
        Renderer.container.addChild(GateManager._gate1BottomSprite);

        GateManager._gateHasOpenedSprite = new PIXI.Sprite(GateManager.GATE_HAS_OPENED_TEXTURE);
        GateManager._gateHasOpenedSprite.position.x = window.innerWidth / 2;
        GateManager._gateHasOpenedSprite.position.y = window.innerHeight * 0.25;
        GateManager._gateHasOpenedSprite.anchor.x = 0.5;
        GateManager._gateHasOpenedSprite.anchor.y = 0.5;
        GateManager._gateHasOpenedSprite.alpha = 0;
        Renderer.staticContainer.addChild(GateManager._gateHasOpenedSprite);

        GateManager._gateOpenedTextDeltaTime = 0;
    }

    static update(time, dt) {
        if (GateManager._gateOpenedTextDeltaTime > 0) {
            GateManager._gateOpenedTextDeltaTime += dt;

            if (GateManager._gateOpenedTextDeltaTime < 1600) {
                const progress = Math.min(GateManager._gateOpenedTextDeltaTime / 1600, 1);
                GateManager._gateHasOpenedSprite.alpha = progress * progress * progress;
            } else if (GateManager._gateOpenedTextDeltaTime < 5600) {
                GateManager._gateHasOpenedSprite.alpha = 1;
            } else {
                const progress = Math.min(Math.max(GateManager._gateOpenedTextDeltaTime - 5600, 0) / (7000 - 5600), 1);
                GateManager._gateHasOpenedSprite.alpha = MathHelper.easeInOut(1 - progress);
            }

            if (GateManager._gateOpenedTextDeltaTime > 7000) {
                GateManager._gateOpenedTextDeltaTime = 0;
                GateManager._gateHasOpenedSprite.alpha = 0;
            }
        }
    }

    static openGate1() {
        GateManager._gate1TopSprite.gotoAndPlay(0);
        GateManager._gate1BottomSprite.gotoAndPlay(0);

        GateManager._gateOpenedTextDeltaTime = 1;
    }
}