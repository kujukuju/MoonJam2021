class Level {
    static IMAGE_NAME_TO_ANCHOR_MAP = {
        'House 1 flipped1.png': 700 / 920,
        'House 1 flipped2.png': 495 / 967,
        'HOUSE 2 flipped1.png': 691 / 963,
        'HOUSE 2 flipped2.png': 417 / 867,
        'house 3 flipped1.png': 700 / 899,
        'house 3 flipped2.png': 559 / 1016,
        'HOUSE NEW 11.png': 723 / 912,
        'HOUSE NEW 12.png': 500 / 973,
        'HOUSE NEW 21.png': 700 / 960,
        'HOUSE NEW 22.png': 422 / 870,
        'HOUSE NEW 31.png': 712 / 905,
        'HOUSE NEW 32.png': 564 / 1010,
    };

    _sprite;

    _wallProxies;
    _wallTree;
    _spawns;

    // {room: [{beat, point, enemyClass}, ...], ...}
    _enemySpawns;

    _doors;
    _boundaries;
    _nextAreas;

    _lastProcessedBeat;

    _spriteTree;
    _visibleSprites;

    _shadowSpriteTree;
    _visibleShadowSprites;

    constructor() {
        this._wallProxies = [];
        this._wallTree = new box2d.b2DynamicTree();
        this._spawns = {};

        this._enemySpawns = {};
        this._doors = [];
        this._boundaries = [];
        this._nextAreas = [];

        this._lastProcessedBeat = -1;

        this._spriteTree = new box2d.b2DynamicTree();
        this._visibleSprites = [];

        this._shadowSpriteTree = new box2d.b2DynamicTree();
        this._visibleShadowSprites = [];

        this._loadLevel(LevelConstants.LEVEL);
    }

    update(time, dt) {
        const currentBeat = Math.floor(MusicManager.getCurrentBeat(time));

        while (currentBeat > this._lastProcessedBeat) {
            this._lastProcessedBeat++;

            const room = StateManager.getCurrentRoom();
            const roomSpawns = this._enemySpawns[room];
            if (roomSpawns) {
                for (let i = 0; i < roomSpawns.length; i++) {
                    if (roomSpawns[i].delay === this._lastProcessedBeat) {
                        const enemy = new roomSpawns[i].EnemyClass();
                        enemy.setPosition(roomSpawns[i].point[0], roomSpawns[i].point[1]);

                        EntityInformation.addEntity(enemy);
                    }
                }
            }
        }

        const cameraAABB = Camera.getAABB();
        const aabb = new box2d.b2AABB();
        aabb.lowerBound.x = cameraAABB[0][0];
        aabb.lowerBound.y = cameraAABB[0][1];
        aabb.upperBound.x = cameraAABB[1][0];
        aabb.upperBound.y = cameraAABB[1][1];

        for (let i = 0; i < this._visibleSprites.length; i++) {
            this._visibleSprites[i].visible = false;
        }
        this._visibleSprites.length = 0;

        for (let i = 0; i < this._visibleShadowSprites.length; i++) {
            this._visibleShadowSprites[i].visible = false;
        }
        this._visibleShadowSprites.length = 0;

        this._spriteTree.Query(node => {
            node.userData.visible = true;
            this._visibleSprites.push(node.userData);

            return true;
        }, aabb);

        this._shadowSpriteTree.Query(node => {
            node.userData.visible = true;
            this._visibleShadowSprites.push(node.userData);

            return true;
        }, aabb);
    }

    resetBeat() {
        this._lastProcessedBeat = -1;
    }

    getSpawn(room) {
        return this._spawns[room];
    }

    getPotentialWalls(aabb) {
        const walls = [];
        this._wallTree.Query(node => {
            walls.push(node.userData);

            return true;
        }, aabb);

        return walls;
    }

    getBoundaries() {
        return this._boundaries;
    }

    openDoorsForRoom(room) {
        const doors = this._doors.filter(door => door.room === room);
        for (let i = 0; i < doors.length; i++) {
            let index = -1;
            for (let a = 0; a < this._wallProxies.length; a++) {
                const proxy = this._wallProxies[a];
                if (proxy.userData === doors[i].polygon) {
                    index = a;
                    break;
                }
            }
            if (index === -1) {
                console.error('Tried to remove a door and couldn\'t find the corresponding wall.', doors[i], room);
                continue;
            }

            const proxy = this._wallProxies[index];
            this._wallTree.DestroyProxy(proxy);

            this._wallProxies.splice(index, 1);
        }
    }

    canTraceLine(p1, p2) {
        const aabb = new box2d.b2AABB();
        aabb.lowerBound.x = Math.min(p1[0], p2[0]);
        aabb.lowerBound.y = Math.min(p1[1], p2[1]);
        aabb.upperBound.x = Math.max(p1[0], p2[0]);
        aabb.upperBound.y = Math.max(p1[1], p2[1]);

        // check if this line can be drawn without hitting any walls
        const potentialWalls = this.getPotentialWalls(aabb);
        if (potentialWalls.length > 0) {
            const segment = [p1, p2];

            for (let i = 0; i < potentialWalls.length; i++) {
                const potential = potentialWalls[i];
                if (MathHelper.intersectLinePolygon(null, potential, segment)) {
                    return false;
                }
            }
        }

        return true;
    }

    reset() {
        this._lastProcessedBeat = -1;
    }

    getNextAreaRoom(point) {
        for (let i = 0; i < this._nextAreas.length; i++) {
            if (MathHelper.isPointInPolygon(point, this._nextAreas[i].polygon)) {
                return this._nextAreas[i].room;
            }
        }

        return null;
    }

    _createSpawn(point, delay, EnemyClass) {
        return {
            point: point,
            delay: delay,
            EnemyClass: EnemyClass,
        };
    }

    _createDoor(polygon, room) {
        return {
            polygon: polygon,
            room: room,
        };
    }

    _createNextArea(polygon, room) {
        return {
            polygon: polygon,
            room: room,
        };
    }

    _requested;
    _imageLayers;
    _loadLevel(json) {
        // [{src: 'src', x: 0, y: 0, shadow: false}]
        this._requested = {};
        this._imageLayers = [];

        const layers = json.layers;
        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];

            this._readLayer(layer, 0, 0);
        }

        // load textures here now
        Renderer._application.loader.load((loaderInstance, resources) => {
            for (let i = 0; i < this._imageLayers.length; i++) {
                const layer = this._imageLayers[i];
                const src = layer.src;
                const x = layer.x;
                const y = layer.y;
                const shadow = layer.shadow;

                const texture = resources[src].texture;
                if (texture.width > 4096 || texture.height > 4096) {
                    console.error('Texture is massive. Skipping. ', texture.width, texture.height, layer.name, layer.id, layer);
                }

                const sprite = new PIXI.Sprite(texture);
                sprite.position.x = x;
                sprite.position.y = y;
                sprite.visible = false;
                Renderer._application.renderer.plugins.prepare.upload(sprite, () => {});

                const aabb = new box2d.b2AABB();
                aabb.lowerBound.x = x;
                aabb.lowerBound.y = y;
                aabb.upperBound.x = x + texture.width;
                aabb.upperBound.y = y + texture.height;
                if (Level.IMAGE_NAME_TO_ANCHOR_MAP[src]) {
                    sprite.zIndex = sprite.position.y + texture.height * Level.IMAGE_NAME_TO_ANCHOR_MAP[src];
                } else {
                    sprite.zIndex = sprite.position.y + texture.height - 120;
                }

                if (shadow) {
                    this._shadowSpriteTree.CreateProxy(aabb, sprite);
                    Renderer.levelShadowContainer.addChild(sprite);
                } else {
                    this._spriteTree.CreateProxy(aabb, sprite);
                    Renderer.container.addChild(sprite);
                }
            }
        });
    }

    _readLayer(layer, offsetX, offsetY) {
        if (layer.x !== 0 || layer.y !== 0) {
            console.error('Found a layer with an offset. This is not okay. ', layer.id);
        }

        switch (layer.type) {
            case 'objectgroup': {
                if (layer.name === 'boundaries') {
                    const objects = layer.objects;
                    for (let a = 0; a < objects.length; a++) {
                        const object = objects[a];

                        if (object.polyline) {
                            const line = object.polyline.map(point => {
                                return [object.x + point.x, object.y + point.y];
                            });

                            this._boundaries.push(line);
                        } else {
                            console.error('Boundaries can only be polylines.');
                        }
                    }
                } else {
                    const objects = layer.objects;
                    for (let a = 0; a < objects.length; a++) {
                        const object = objects[a];

                        // we shouldn't support polylines, because the physics requires there to be a polygon to push out of
                        if (object.polygon) {
                            if (object.type === 'door') {
                                const polygon = object.polygon.map(point => [point.x + object.x, point.y + object.y]);
                                if (!MathHelper.isPolygonCCW(polygon)) {
                                    console.error('Found polygon that\'s not CCW.', object.id);
                                    continue;
                                }

                                const roomProperty = object.properties ? object.properties.find(entry => entry.name === 'room') : null;
                                const room = roomProperty ? roomProperty.value : -1;

                                if (room === -1) {
                                    console.error('Found a door without a room property.', object.id);
                                }

                                const aabb = MathHelper.createAABBFromPolygon(polygon);
                                const proxy = this._wallTree.CreateProxy(aabb, polygon);

                                this._wallProxies.push(proxy);
                                this._doors.push(this._createDoor(polygon, room))
                            } else if (object.type === 'nextarea') {
                                const polygon = object.polygon.map(point => [point.x + object.x, point.y + object.y]);
                                if (!MathHelper.isPolygonCCW(polygon)) {
                                    console.error('Found polygon that\'s not CCW.', object.id);
                                    continue;
                                }

                                const roomProperty = object.properties ? object.properties.find(entry => entry.name === 'room') : null;
                                const room = roomProperty ? roomProperty.value : -1;

                                if (room === -1) {
                                    console.error('Found a nextarea without a room property.', object.id);
                                }

                                this._nextAreas.push(this._createNextArea(polygon, room));
                            } else {
                                const polygon = object.polygon.map(point => [point.x + object.x, point.y + object.y]);
                                if (!MathHelper.isPolygonCCW(polygon)) {
                                    console.error('Found polygon that\'s not CCW.', object.id);
                                    continue;
                                }

                                const aabb = MathHelper.createAABBFromPolygon(polygon);

                                this._wallTree.CreateProxy(aabb, polygon);
                            }
                        } else if (object.point) {
                            const point = [object.x, object.y];

                            switch (object.type) {
                                case 'spawn': {
                                    const roomProperty = object.properties ? object.properties.find(entry => entry.name === 'room') : null;
                                    const room = roomProperty ? roomProperty.value : -1;

                                    if (room === -1) {
                                        console.error('Found a spawn without a room property.', object.id);
                                    }

                                    this._spawns[room] = point;
                                } break;

                                case 'bat-spawn': {
                                    const delayProperty = object.properties ? object.properties.find(entry => entry.name === 'delay') : null;
                                    const delay = delayProperty ? delayProperty.value : 0;

                                    const roomProperty = object.properties ? object.properties.find(entry => entry.name === 'room') : null;
                                    const room = roomProperty ? roomProperty.value : -1;

                                    if (room === -1) {
                                        console.error('Found a spawn without a room property.', object.id);
                                    }

                                    // TODO hacky test stuff
                                    // if (room === 1 && object.id !== 764) {
                                    //     continue;
                                    // }
                                    // if (room === 2 && object.id !== 966) {
                                    //     continue;
                                    // }

                                    if (!this._enemySpawns[room]) {
                                        this._enemySpawns[room] = [];
                                    }

                                    this._enemySpawns[room].push(this._createSpawn(point, delay, BatEntity));
                                } break;

                                case 'ghoul-spawn': {
                                    const delayProperty = object.properties ? object.properties.find(entry => entry.name === 'delay') : null;
                                    const delay = delayProperty ? delayProperty.value : 0;

                                    const roomProperty = object.properties ? object.properties.find(entry => entry.name === 'room') : null;
                                    const room = roomProperty ? roomProperty.value : -1;

                                    if (room === -1) {
                                        console.error('Found a spawn without a room property.', object.id);
                                    }

                                    // TODO hacky test stuff
                                    // if (room === 1 && object.id !== 764) {
                                    //     continue;
                                    // }
                                    // if (room === 2 && object.id !== 966) {
                                    //     continue;
                                    // }

                                    if (!this._enemySpawns[room]) {
                                        this._enemySpawns[room] = [];
                                    }

                                    this._enemySpawns[room].push(this._createSpawn(point, delay, GhoulEntity));
                                } break;

                                case 'zombie-spawn': {
                                    const delayProperty = object.properties ? object.properties.find(entry => entry.name === 'delay') : null;
                                    const delay = delayProperty ? delayProperty.value : 0;

                                    const roomProperty = object.properties ? object.properties.find(entry => entry.name === 'room') : null;
                                    const room = roomProperty ? roomProperty.value : -1;

                                    if (room === -1) {
                                        console.error('Found a spawn without a room property.', object.id);
                                    }

                                    // TODO hacky test stuff
                                    // if (room === 1 && object.id !== 764) {
                                    //     continue;
                                    // }
                                    // if (room === 2 && object.id !== 966) {
                                    //     continue;
                                    // }

                                    if (!this._enemySpawns[room]) {
                                        this._enemySpawns[room] = [];
                                    }

                                    this._enemySpawns[room].push(this._createSpawn(point, delay, ZombieEntity));
                                } break;

                                default:
                                    console.error('Unknown point type.', object.type, object.id);
                            }
                        }
                    }
                }
            } break;

            case 'imagelayer': {
                const src = layer.image;
                const positionX = layer.offsetx + offsetX;
                const positionY = layer.offsety + offsetY;

                this._imageLayers.push({
                    src: src,
                    x: positionX,
                    y: positionY,
                    shadow: layer.name.toLowerCase().includes('shadow'),
                });

                if (this._requested[src]) {
                    return;
                }
                this._requested[src] = true;

                Renderer._application.loader.add(src, 'assets/' + src, {metadata: {choice: ['.dds', '.png']}});

                // const texture = PIXI.Texture.from('assets/' + src);
                // const sprite = new PIXI.Sprite(texture);
                // sprite.position.x = positionX;
                // sprite.position.y = positionY;
                // sprite.visible = false;
                //
                // if (layer.name.toLowerCase().includes('shadow')) {
                //     texture.baseTexture.once('loaded', () => {
                //         if (texture.width > 4096 || texture.height > 4096) {
                //             console.error('Texture is massive. Skipping. ', texture.width, texture.height, layer.name, layer.id, layer);
                //             return;
                //         }
                //
                //         const aabb = new box2d.b2AABB();
                //         aabb.lowerBound.x = positionX;
                //         aabb.lowerBound.y = positionY;
                //         aabb.upperBound.x = positionX + texture.width;
                //         aabb.upperBound.y = positionY + texture.height;
                //         if (Level.IMAGE_NAME_TO_ANCHOR_MAP[src]) {
                //             sprite.zIndex = sprite.position.y + texture.height * Level.IMAGE_NAME_TO_ANCHOR_MAP[src];
                //         } else {
                //             sprite.zIndex = sprite.position.y + texture.height - 120;
                //         }
                //
                //         this._shadowSpriteTree.CreateProxy(aabb, sprite);
                //         Renderer.levelShadowContainer.addChild(sprite);
                //     });
                //
                // } else {
                //     texture.baseTexture.once('loaded', () => {
                //         if (texture.width > 4096 || texture.height > 4096) {
                //             console.error('Texture is massive. Skipping. ', texture.width, texture.height, layer.name, layer.id, layer);
                //             return;
                //         }
                //
                //         const aabb = new box2d.b2AABB();
                //         aabb.lowerBound.x = positionX;
                //         aabb.lowerBound.y = positionY;
                //         aabb.upperBound.x = positionX + texture.width;
                //         aabb.upperBound.y = positionY + texture.height;
                //         if (Level.IMAGE_NAME_TO_ANCHOR_MAP[src]) {
                //             sprite.zIndex = sprite.position.y + texture.height * Level.IMAGE_NAME_TO_ANCHOR_MAP[src];
                //         } else {
                //             sprite.zIndex = sprite.position.y + texture.height - 120;
                //         }
                //
                //         this._spriteTree.CreateProxy(aabb, sprite);
                //         Renderer.container.addChild(sprite);
                //     });
                // }
            } break;

            case 'group': {
                const layers = layer.layers;
                for (let b = 0; b < layers.length; b++) {
                    this._readLayer(layers[b], offsetX + (layer.offsetx ?? 0), offsetY + (layer.offsety ?? 0));
                }
            } break;

            default:
                console.error('Found unknown layer type.', layer.type);
        }
    }
}