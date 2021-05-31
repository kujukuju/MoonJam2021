class AbilityInformation {
    static _abilitiesByID = {

    };

    static update(time, dt) {
        for (const abilityID in AbilityInformation._abilitiesByID) {
            const ability = AbilityInformation._abilitiesByID[abilityID];
            ability.update(time, dt);
        }
    }

    static addAbility(ability) {
        AbilityInformation._abilitiesByID[ability.getAbilityID()] = ability;
    }

    static removeAbility(ability) {
        delete AbilityInformation._abilitiesByID[ability.getAbilityID()];
    }

    static destroyAllAbilities() {
        const keys = Object.keys(AbilityInformation._abilitiesByID);
        for (let i = 0; i < keys.length; i++ ) {
            const abilityID = keys[i];
            AbilityInformation._abilitiesByID[abilityID].destroy();
        }
    }

    static hasOsuAbility() {
        for (const abilityID in AbilityInformation._abilitiesByID) {
            const ability = AbilityInformation._abilitiesByID[abilityID];

            if (ability instanceof Osu) {
                return true;
            }
        }

        return false;
    }
}