class Ability {
    static _nextAbilityID = 1;

    constructor() {
        this._abilityID = Ability._getNextAbilityID();
    }

    update(time, dt) {

    }

    getAbilityID() {
        return this._abilityID;
    }

    destroy() {
        AbilityInformation.removeAbility(this);
    }

    static _getNextAbilityID() {
        return Ability._nextAbilityID++;
    }
}