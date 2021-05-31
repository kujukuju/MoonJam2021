class TheEndManager {
    static _sprite;
    static _text;

    static _countdown;

    static initialize() {
        TheEndManager._sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
        TheEndManager._sprite.width = window.innerWidth;
        TheEndManager._sprite.height = window.innerHeight;
        TheEndManager._sprite.alpha = 0;
        Renderer.staticEndContainer.addChild(TheEndManager._sprite);

        TheEndManager._text = new PIXI.Text('The End\nThanks for playing!', {
            fontFamily: 'meta',
            fontSize: 32,
            fill: 0x000000,
            align: 'center'});
        TheEndManager._text.anchor.x = 0.5;
        TheEndManager._text.anchor.y = 0.5;
        TheEndManager._text.position.x = window.innerWidth / 2;
        TheEndManager._text.position.y = window.innerHeight / 2 - 40;
        TheEndManager._text.alpha = 0;
        Renderer.staticEndContainer.addChild(TheEndManager._text);

        TheEndManager._countdown = 8000;
    }

    static update(time, dt) {
        if (BossManager._phase === 5) {
            TheEndManager._countdown -= dt;

            if (TheEndManager._countdown < 0) {
                TheEndManager._sprite.alpha = Math.min(TheEndManager._sprite.alpha + 0.001 * dt, 1);
                TheEndManager._text.alpha = Math.min(TheEndManager._text.alpha + 0.001 * dt, 1);
            }
        }
    }
}