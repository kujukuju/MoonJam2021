class Renderer {
    static _application;

    static backgroundContainer;
    static levelShadowContainer;
    static boundaryContainer;
    static shadowContainer;
    static enemyArrowContainer;
    static arrowContainer;
    static deadBodyContainer;
    static container;
    static staticOsuContainer;
    static staticContainer;

    static initialize() {
        // lol
        // PIXI.settings.GC_MAX_IDLE *= 8;
        PIXI.settings.MIPMAP_TEXTURES = PIXI.MIPMAP_MODES.OFF;

        Renderer._application = new PIXI.Application({
            antialias: true,
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x444444,
        });

        const container = document.getElementById('canvas-container');
        container.appendChild(Renderer._application.view);

        Renderer.backgroundContainer = new PIXI.Container();
        Renderer.levelShadowContainer = new PIXI.Container();
        Renderer.boundaryContainer = new PIXI.Container();
        Renderer.shadowContainer = new PIXI.Container();
        Renderer.enemyArrowContainer = new PIXI.Container();
        Renderer.arrowContainer = new PIXI.Container();
        Renderer.deadBodyContainer = new PIXI.Container();
        Renderer.container = new PIXI.Container();
        Renderer.container.sortableChildren = true;
        Renderer.staticOsuContainer = new PIXI.Container();
        Renderer.staticContainer = new PIXI.Container();

        Renderer._application.stage.addChild(Renderer.backgroundContainer);
        Renderer._application.stage.addChild(Renderer.levelShadowContainer);
        Renderer._application.stage.addChild(Renderer.boundaryContainer);
        Renderer._application.stage.addChild(Renderer.shadowContainer);
        Renderer._application.stage.addChild(Renderer.enemyArrowContainer);
        Renderer._application.stage.addChild(Renderer.arrowContainer);
        Renderer._application.stage.addChild(Renderer.deadBodyContainer);
        Renderer._application.stage.addChild(Renderer.container);
        Renderer._application.stage.addChild(Renderer.staticOsuContainer);
        Renderer._application.stage.addChild(Renderer.staticContainer);
    }
}

