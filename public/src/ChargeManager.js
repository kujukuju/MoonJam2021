class ChargeManager {
    static GUN_TEXT = PIXI.Texture.from('assets/gunshot-charge.png');
    static DASH_TEXT = PIXI.Texture.from('assets/dash-charge.png');
    static ULT_TEXT = PIXI.Texture.from('assets/ultimate-charge.png');

    static _gunSprite;
    static _dashSprite;
    static _ultSprite;

    static _gunFill;
    static _dashFill;
    static _ultFill;

    static _chargeGun = 0;
    static _chargeDash = 0;
    static _chargeUlt = 1;

    static _chargeGunStageStart = 0;
    static _chargeDashStageStart = 0;
    static _chargeUltStageStart = 0;
    static _chargeStageStored = 0;

    static initialize() {
        ChargeManager._gunFill = new PIXI.Sprite(PIXI.Texture.WHITE);
        ChargeManager._gunFill.position.x = 3 * 0.4 + 110;
        ChargeManager._gunFill.position.y = 45 * 0.4 + 40;
        ChargeManager._gunFill.width = 399 * 0.4;
        ChargeManager._gunFill.height = 98 * 0.4;
        ChargeManager._gunFill.alpha = 0.5;
        Renderer.staticContainer.addChild(ChargeManager._gunFill);
        ChargeManager._dashFill = new PIXI.Sprite(PIXI.Texture.WHITE);
        ChargeManager._dashFill.position.x = 3 * 0.4 + (110 + 1190 / 2) - 1 - 399 * 0.4 * 0.5;
        ChargeManager._dashFill.position.y = 45 * 0.4 + 40;
        ChargeManager._dashFill.width = 399 * 0.4;
        ChargeManager._dashFill.height = 98 * 0.4;
        ChargeManager._dashFill.alpha = 0.5;
        // Renderer.staticContainer.addChild(ChargeManager._dashFill);
        ChargeManager._ultFill = new PIXI.Sprite(PIXI.Texture.WHITE);
        ChargeManager._ultFill.position.x = 3 * 0.4 + (window.innerWidth - 605) - 2 - 399 * 0.4;
        ChargeManager._ultFill.position.y = 45 * 0.4 + 40;
        ChargeManager._ultFill.width = 399 * 0.4;
        ChargeManager._ultFill.height = 98 * 0.4
        ChargeManager._ultFill.alpha = 0.5;
        Renderer.staticContainer.addChild(ChargeManager._ultFill);

        ChargeManager._gunSprite = new PIXI.Sprite(ChargeManager.GUN_TEXT);
        ChargeManager._gunSprite.position.x = 110;
        ChargeManager._gunSprite.position.y = 40;
        ChargeManager._gunSprite.scale.x = 0.4;
        ChargeManager._gunSprite.scale.y = 0.4;
        ChargeManager._gunSprite.alpha = 0;
        Renderer.staticContainer.addChild(ChargeManager._gunSprite);

        ChargeManager._dashSprite = new PIXI.Sprite(ChargeManager.DASH_TEXT);
        ChargeManager._dashSprite.position.x = 110 + 1190 / 2;
        ChargeManager._dashSprite.position.y = 40;
        ChargeManager._dashSprite.scale.x = 0.4;
        ChargeManager._dashSprite.scale.y = 0.4;
        ChargeManager._dashSprite.anchor.x = 0.5;
        ChargeManager._dashSprite.alpha = 0;
        // Renderer.staticContainer.addChild(ChargeManager._dashSprite);

        ChargeManager._ultSprite = new PIXI.Sprite(ChargeManager.ULT_TEXT);
        ChargeManager._ultSprite.position.x = window.innerWidth - 605;
        ChargeManager._ultSprite.position.y = 40;
        ChargeManager._ultSprite.scale.x = 0.4;
        ChargeManager._ultSprite.scale.y = 0.4;
        ChargeManager._ultSprite.anchor.x = 1;
        ChargeManager._ultSprite.alpha = 0;

        Renderer.staticContainer.addChild(ChargeManager._ultSprite);
    }

    static update(time, dt) {
        if (MusicManager.isStageMusic()) {
            ChargeManager._gunSprite.alpha = Math.min(ChargeManager._gunSprite.alpha + dt * 0.001, 1);
            ChargeManager._dashSprite.alpha = Math.min(ChargeManager._dashSprite.alpha + dt * 0.001, 1);
            ChargeManager._ultSprite.alpha = Math.min(ChargeManager._ultSprite.alpha + dt * 0.001, 1);
            ChargeManager._gunFill.alpha = Math.min(ChargeManager._gunFill.alpha + dt * 0.0005, 0.5);
            ChargeManager._dashFill.alpha = Math.min(ChargeManager._dashFill.alpha + dt * 0.0005, 0.5);
            ChargeManager._ultFill.alpha = Math.min(ChargeManager._ultFill.alpha + dt * 0.0005, 0.5);
        } else {
            ChargeManager._gunSprite.alpha = Math.max(ChargeManager._gunSprite.alpha - dt * 0.001, 0);
            ChargeManager._dashSprite.alpha = Math.max(ChargeManager._dashSprite.alpha - dt * 0.001, 0);
            ChargeManager._ultSprite.alpha = Math.max(ChargeManager._ultSprite.alpha - dt * 0.001, 0);
            ChargeManager._gunFill.alpha = Math.max(ChargeManager._gunFill.alpha - dt * 0.0005, 0);
            ChargeManager._dashFill.alpha = Math.max(ChargeManager._dashFill.alpha - dt * 0.0005, 0);
            ChargeManager._ultFill.alpha = Math.max(ChargeManager._ultFill.alpha - dt * 0.0005, 0);
        }

        ChargeManager._gunFill.width = 399 * 0.4 * ChargeManager._chargeGun;
        ChargeManager._dashFill.width = 399 * 0.4 * ChargeManager._chargeDash;
        ChargeManager._ultFill.width = 399 * 0.4 * ChargeManager._chargeUlt;

        if (ChargeManager._chargeDash === 1) {
            ChargeManager._dashFill.alpha = 1;
        }
        if (ChargeManager._chargeGun === 1) {
            ChargeManager._gunFill.alpha = 1;
        }
        if (ChargeManager._chargeUlt === 1) {
            ChargeManager._ultFill.alpha = 1;
        }

        if (StateManager.getCurrentRoom() > ChargeManager._chargeStageStored) {
            ChargeManager._chargeStageStored = StateManager.getCurrentRoom();

            ChargeManager._chargeDashStageStart = ChargeManager._chargeDash;
            ChargeManager._chargeGunStageStart = ChargeManager._chargeGun;
            ChargeManager._chargeUltStageStart = ChargeManager._chargeUlt;
        }
    }

    static reset() {
        ChargeManager._chargeGun = ChargeManager._chargeGunStageStart;
        ChargeManager._chargeDash = ChargeManager._chargeDashStageStart;
        ChargeManager._chargeUlt = ChargeManager._chargeUltStageStart;
    }

    static canGun() {
        return ChargeManager._chargeGun === 1;
    }

    static consumeGunCharge() {
        ChargeManager._chargeGun = 0;
    }

    static canDash() {
        return true; ChargeManager._chargeDash === 1;
    }

    static consumeDashCharge() {
        ChargeManager._chargeDash = 0;
    }

    static canUlt() {
        return ChargeManager._chargeUlt === 1;
    }

    static consumeUltCharge() {
        ChargeManager._chargeUlt = 0;
    }

    static addPerfect() {
        ChargeManager._chargeGun = Math.min(ChargeManager._chargeGun + 1 / 4, 1);
        ChargeManager._chargeDash = Math.min(ChargeManager._chargeDash + 1 / 2, 1);
        ChargeManager._chargeUlt = Math.min(ChargeManager._chargeUlt + 1 / 10, 1);
        // ChargeManager._chargeUlt = Math.min(ChargeManager._chargeUlt + 1 / 2, 1);
    }
}