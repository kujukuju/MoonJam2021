class EntityInformation {
    static _clientEntityID = null;

    static _entitiesByID = {};
    static _entityTree = new box2d.b2DynamicTree();

    static _entityIDToProxyMap = {};

    static initialize() {
        // just a warning here, I'm reusing this method to restart the current room
        const moonEntity = new MoonEntity();

        EntityInformation.addEntity(moonEntity);
        EntityInformation.setClientEntityID(moonEntity.getEntityID());
    }

    static update(time, dt) {
        if (!EntityInformation.getClientEntity()) {
            return;
        }

        if (dt > 200) {
            return;
        }

        const cameraAABB = Camera.getAABB();
        cameraAABB[0][0] -= 500;
        cameraAABB[0][1] -= 500;
        cameraAABB[1][0] += 500;
        cameraAABB[1][1] += 1000;

        const hasOsuAbility = AbilityInformation.hasOsuAbility();
        for (const entityID in EntityInformation._entitiesByID) {
            const entity = EntityInformation._entitiesByID[entityID];
            const position = entity.getPosition();
            if (MathHelper.isPointInAABB(position, cameraAABB)) {
                entity.update(time, dt);
            } else {
                // screen enlarges so we need to keep them visible
                if (!hasOsuAbility) {
                    entity.setHidden();
                }
            }
        }

        for (const entityID in EntityInformation._entitiesByID) {
            const entity = EntityInformation._entitiesByID[entityID];
            const position = entity.getPosition();

            const aabb = new box2d.b2AABB();
            aabb.lowerBound.x = position[0];
            aabb.lowerBound.y = position[1];
            aabb.upperBound.x = position[0];
            aabb.upperBound.y = position[1];

            if (!EntityInformation._entityIDToProxyMap[entityID]) {
                EntityInformation._entityIDToProxyMap[entityID] = EntityInformation._entityTree.CreateProxy(aabb, entityID);
            } else {
                const proxy = EntityInformation._entityIDToProxyMap[entityID];
                EntityInformation._entityTree.MoveProxy(proxy, aabb, box2d.b2Vec2_zero);
            }
        }
    }

    static getEntity(entityID) {
        return EntityInformation._entitiesByID[entityID] ?? null;
    }

    static getEntityList() {
        return Object.values(EntityInformation._entitiesByID);
    }

    static getEntityCount() {
        // this method sucks but oh well
        return Object.keys(EntityInformation._entitiesByID).length;
    }

    static getEntities(position, radius) {
        const aabb = new box2d.b2AABB();
        aabb.lowerBound.x = position[0] - radius;
        aabb.lowerBound.y = position[1] - radius;
        aabb.upperBound.x = position[0] + radius;
        aabb.upperBound.y = position[1] + radius;

        const entities = [];
        EntityInformation._entityTree.Query(node => {
            const entityID = node.userData;

            // TODO this is debug code
            for (let i = 0; i < entities.length; i++) {
                const existingEntityID = entities[i].getEntityID();

                if (entityID === existingEntityID) {
                    console.error('Double adding entity into bvh tree lookup thing.');
                    return true;
                }
            }

            const entity = EntityInformation._entitiesByID[entityID];
            if (entity) {
                entities.push(entity);
            }

            return true;
        }, aabb);

        // const entities = [];
        // for (const entityID in EntityInformation._entitiesByID) {
        //     const entity = EntityInformation._entitiesByID[entityID];
        //     const entityPosition = entity.getPosition();
        //
        //     const dx = entityPosition[0] - position[0];
        //     const dy = entityPosition[1] - position[1];
        //     const d2 = dx * dx + dy * dy;
        //
        //     if (d2 <= r2) {
        //         entities.push(entity);
        //     }
        // }

        return entities;
    }

    static addEntity(entity) {
        EntityInformation._entitiesByID[entity.getEntityID()] = entity;
    }

    static removeEntity(entity) {
        const entityID = entity.getEntityID();
        delete EntityInformation._entitiesByID[entityID];

        if (EntityInformation._entityIDToProxyMap[entityID]) {
            const proxy = EntityInformation._entityIDToProxyMap[entityID];
            delete EntityInformation._entityIDToProxyMap[entityID];

            // delete proxy from tree
        }
    }

    static getClientEntity() {
        return EntityInformation._entitiesByID[EntityInformation._clientEntityID] ?? null;
    }

    static setClientEntityID(entityID) {
        EntityInformation._clientEntityID = entityID;

        const spawn = LevelManager.level.getSpawn(StateManager.getCurrentRoom());

        const clientEntity = EntityInformation.getClientEntity();
        clientEntity.setPosition(spawn[0], spawn[1]);
    }

    static destroyAllEntities() {
        const keys = Object.keys(EntityInformation._entitiesByID);
        for (let i = 0; i < keys.length; i++) {
            const entityID = keys[i];
            EntityInformation._entitiesByID[entityID].destroy();
        }
    }
}