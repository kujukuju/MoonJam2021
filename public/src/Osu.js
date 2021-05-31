class Osu extends Ability {
    static CIRCLE_TEXTURE = PIXI.Texture.from('assets/osu-note.png');
    static RING_TEXTURE = PIXI.Texture.from('assets/osu-ring.png');

    // static DURATION = 8000;
    static DURATION = 800000;
    static ZOOM_DENSITY = 0.5;

    _deltaTime;
    _fadeOutDeltaTime;

    _beatDuration;

    // 0 is playing osu
    // 1 is fading out and immortal
    _stage;

    _position;

    _blackOverlaySprite;

    _sequence;
    _sequenceSprites;
    _missed;

    _mouseLeft;
    _key;

    constructor(time, duration) {
        super();

        const owner = EntityInformation.getClientEntity();
        if (!owner) {
            this.destroy();
            return;
        }

        const ownerPosition = owner.getPosition();

        this._deltaTime = 0;
        this._fadeOutDeltaTime = 0;

        this._mouseLeft = false;
        this._key = false;

        // 2 beats
        this._beatDuration = duration;
        // make immortal here
        owner.setForcedImmortalUntil(Date.now() + this._beatDuration * 3);

        this._stage = 0;

        // freeze frame on camera position and zoom out
        this._position = [owner.getPosition()[0], owner.getPosition()[1]];

        // freeze all entities here too
        const entities = EntityInformation.getEntityList();
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];

            entity.setForcedAccelMul(0);
        }

        const padding = 400;
        const aabb = Camera.getAABB();
        const cameraCenter = [
            (aabb[0][0] + aabb[1][0]) / 2,
            (aabb[0][1] + aabb[1][1]) / 2,
        ];
        const cameraDimensions = [
            aabb[1][0] - aabb[0][0],
            aabb[1][1] - aabb[0][1],
        ];
        const cameraAABB = [
            [cameraCenter[0] - cameraDimensions[0] / 2 / Osu.ZOOM_DENSITY, cameraCenter[1] - cameraDimensions[1] / 2 / Osu.ZOOM_DENSITY],
            [cameraCenter[0] + cameraDimensions[0] / 2 / Osu.ZOOM_DENSITY, cameraCenter[1] + cameraDimensions[1] / 2 / Osu.ZOOM_DENSITY],
        ];
        const potentialEntities = entities.filter(entity => {
            if (entity === owner) {
                return false;
            }

            entity.setVisible();

            const position = entity.getPosition();
            if (position[0] >= cameraAABB[0][0] + padding && position[0] < cameraAABB[1][0] - padding &&
                    position[1] >= cameraAABB[0][1] + padding && position[1] < cameraAABB[1][1] - padding) {
                return true;
            }

            return false;
        });

        const currentBeat = MusicManager.getCurrentBeat(time);
        const startBeat = Math.round(currentBeat);
        const startTime = MusicManager.convertBeatToMilliseconds(startBeat - currentBeat) + time;

        // 0 is force skip events until next real beat
        // 1 is use all available events spaced more than 0.2 beats apart
        let currentSequence = 0;

        const lastPosition = [ownerPosition[0], ownerPosition[1]];

        // [[time, position, entityID], ...]
        this._sequence = [];
        this._sequenceSprites = [];
        this._missed = [];
        // generating this is gonna be hard...
        let currentSearchingBeat = startBeat + 3;
        let minimumAllowedBeatTime = 0;
        while (currentSearchingBeat < startBeat + 30) {
            let bestIndex = -1;
            let bestPosition = null;
            let bestEntityID = 0;
            let bestDistance = Number.MAX_SAFE_INTEGER;
            let bestBeatTime = 0;

            const currentSearchingTime = startTime + MusicManager.convertBeatToMilliseconds(currentSearchingBeat - startBeat);

            for (let i = 0; i < potentialEntities.length; i++) {
                const potential = potentialEntities[i];
                const relativeBeat = potential._getRelativeBeat(currentSearchingTime);
                const roundedRelativeBeat = Math.round(relativeBeat);
                const isBeat = Math.abs(relativeBeat - roundedRelativeBeat) < 0.1;
                if (!isBeat) {
                    continue;
                }

                const beatTime = potential._getApproximateBeatTime(roundedRelativeBeat);
                if (beatTime < minimumAllowedBeatTime + 40) {
                    continue;
                }

                // we could do this better by getting the actual entity relative beat and converting it into beat and real time but god thats a lot of shit
                const potentialPosition = [potential.getPosition()[0], potential.getPosition()[1] - potential.getHeight()];
                const delta = [
                    potentialPosition[0] - lastPosition[0],
                    potentialPosition[1] - lastPosition[1],
                ];
                const distance = MathHelper.magnitude(delta);
                if (distance < bestDistance) {
                    bestIndex = i;
                    bestPosition = [potentialPosition[0], potentialPosition[1]];
                    bestEntityID = potential.getEntityID();
                    bestDistance = distance;
                    bestBeatTime = beatTime;
                }
            }

            if (bestPosition) {
                // we found an entity for this beat, for better or worse lol
                minimumAllowedBeatTime = bestBeatTime
                this._sequence.push([bestBeatTime, bestPosition, bestEntityID]);

                const screenPosition = Camera.convertToScreenSpace(bestPosition, Osu.ZOOM_DENSITY);

                const circle = new PIXI.Sprite(Osu.CIRCLE_TEXTURE);
                circle.anchor.x = 0.5;
                circle.anchor.y = 0.5;
                circle.scale.x = 0.4;
                circle.scale.y = 0.4;
                circle.position.x = screenPosition[0];
                circle.position.y = screenPosition[1];
                circle.alpha = 0;
                Renderer.staticOsuContainer.addChildAt(circle, 0);
                const ring = new PIXI.Sprite(Osu.RING_TEXTURE);
                ring.anchor.x = 0.5;
                ring.anchor.y = 0.5;
                // ring needs to get to a scale of 0.2
                ring.scale.x = 0.6;
                ring.scale.y = 0.6;
                ring.position.x = screenPosition[0];
                ring.position.y = screenPosition[1];
                ring.alpha = 0;
                Renderer.staticOsuContainer.addChildAt(ring, 0);
                this._sequenceSprites.push([
                    circle,
                    ring,
                ]);
                this._missed.push(false);

                potentialEntities.splice(bestIndex, 1);

                // skip farther so we can avoid getting another note on the same beat and considering it valid
                // currentSearchingBeat += 0.15;
            }

            if (potentialEntities.length === 0) {
                break;
            }

            if (currentSequence === 0) {
                currentSequence = 1;
            } else {
                if (Math.random() < 0.2) {
                    currentSequence = 0;
                }
            }

            if (currentSequence === 0) {
                currentSearchingBeat = Math.round(currentSearchingBeat) + 1;
            } else {
                currentSearchingBeat += 0.05;
            }
        }

        this._blackOverlaySprite = new PIXI.Sprite(PIXI.Texture.WHITE);
        this._blackOverlaySprite.width = window.innerWidth;
        this._blackOverlaySprite.height = window.innerHeight;
        this._blackOverlaySprite.tint = 0x000000;
        this._blackOverlaySprite.alpha = 0.5;
        Renderer.staticOsuContainer.addChildAt(this._blackOverlaySprite, 0);

        ChargeManager.consumeUltCharge();
    }

    update(time, dt) {
        const owner = EntityInformation.getClientEntity();
        if (!owner) {
            this.destroy();
            return;
        }

        if (EntityInformation.getEntityCount() <= 1) {
            this._stage = 1;
        }

        if (this._deltaTime >= Osu.DURATION) {
            this._stage = 1;
        }

        // if (this._fadeOutDeltaTime >= this._beatDuration * 3) {
        //     this.destroy();
        //     return;
        // }

        if (this._stage === 0) {
            const lastTime = this._sequence[this._sequence.length - 1][0];
            const deltaTime = time - lastTime;
            if (deltaTime > this._beatDuration / 8) {
                this._stage = 1;
            }
        }

        if (this._stage === 0) {
            // zoom out, fade in black
            Camera.forcePosition(this._position);

            const fadeInProgress = Math.min(this._deltaTime / this._beatDuration * 2, 1);
            MusicManager.forceSetBassPercentage(fadeInProgress);
            this._blackOverlaySprite.alpha = fadeInProgress * 0.5;
            Camera.forceDensity(1 - fadeInProgress * 0.5);

            // every single entity gets their accel set to 0 lol
            const entities = EntityInformation.getEntityList();
            for (let i = 0; i < entities.length; i++) {
                const entity = entities[i];

                entity.setForcedAccelMul(0);
            }

            let inputEvent = false;
            if (InputManager.mouseDownLeft && !this._mouseLeft) {
                this._mouseLeft = true;
                inputEvent = true;
            }
            if (!InputManager.mouseDownLeft && this._mouseLeft) {
                this._mouseLeft = false;
            }

            const hasInputManagerKey = InputManager.hasKey();
            if (hasInputManagerKey && !this._key) {
                this._key = true;
                inputEvent = true;
            }
            if (!hasInputManagerKey && this._mouseLeft) {
                this._key = false;
            }

            // make immortal here
            owner.setForcedImmortalUntil(time + this._beatDuration * 3);

            // if theres an input event we fill this out to be later processed
            const potentialValidSequenceIndices = [];
            const allowedRadius = 265 / 2 * 0.6 * 1.1 * 1.2;

            for (let i = 0; i < this._sequence.length; i++) {
                const [beatTime, beatPosition, entityID] = this._sequence[i];
                const timeToBeat = Math.max(beatTime - time, 0);
                const progressToBeat = 1 - Math.min(timeToBeat / this._beatDuration / 2, 1);
                const timeAfterBeat = Math.max(time - beatTime, 0);
                const progressAfterBeat = Math.min(timeAfterBeat / this._beatDuration / 2, 1);
                const scaledProgressAfterBeat = Math.min(progressAfterBeat * 32, 1);

                if (this._missed[i]) {
                    const [circle, ring] = this._sequenceSprites[i];
                    circle.alpha = Math.max(circle.alpha - 0.01 * dt, 0);
                    ring.alpha = Math.max(ring.alpha - 0.01 * dt, 0);
                } else {
                    const circleAlpha = MathHelper.easeInOut(Math.min(progressToBeat * 2, 1));
                    // const circleScale = MathHelper.easeInOut(progressToBeat) * 0.2 + 0.2;
                    const ringAlpha = MathHelper.easeInOut(Math.min(progressToBeat * 8, 1));
                    const ringScale = 0.6 - Math.pow(progressToBeat, 2) * 0.4;

                    const endingAlpha = MathHelper.easeInOut(1 - scaledProgressAfterBeat);

                    const [circle, ring] = this._sequenceSprites[i];
                    circle.alpha = Math.min(circleAlpha, endingAlpha);
                    ring.alpha = Math.min(ringAlpha, endingAlpha);
                    ring.scale.x = ringScale;
                    ring.scale.y = ringScale;

                    // TODO debug code
                    // {
                    //     const mouseDelta = [
                    //         circle.position.x - InputManager.mousePosition[0],
                    //         circle.position.y - InputManager.mousePosition[1],
                    //     ];
                    //     const distance = MathHelper.magnitude(mouseDelta);
                    //     if (distance <= allowedRadius) {
                    //         circle.tint = 0x44ff11;
                    //     } else {
                    //         circle.tint = 0xffffff;
                    //     }
                    // }

                    if (inputEvent) {
                        if (progressToBeat > 0 && progressAfterBeat < 1) {
                            const mouseDelta = [
                                circle.position.x - InputManager.mousePosition[0],
                                circle.position.y - InputManager.mousePosition[1],
                            ];
                            const distance = MathHelper.magnitude(mouseDelta);
                            if (distance <= allowedRadius) {
                                potentialValidSequenceIndices.push(i);
                            }
                        }
                    }
                }
            }

            // process the fking input event......
            if (inputEvent) {
                let mostValidIndex = -1;
                let mostValidValue = 0;
                let actuallyValid = false;

                for (let i = 0; i < potentialValidSequenceIndices.length; i++) {
                    const index = potentialValidSequenceIndices[i];
                    const [beatTime, beatPosition, entityID] = this._sequence[index];

                    const timeToBeat = Math.max(beatTime - time, 0);
                    const progressToBeat = 1 - Math.min(timeToBeat / this._beatDuration / 2, 1);
                    const timeAfterBeat = Math.max(time - beatTime, 0);
                    const progressAfterBeat = 1 - Math.min(timeAfterBeat / this._beatDuration / 2, 1);

                    const progress = Math.min(progressToBeat, progressAfterBeat);

                    if (progress > mostValidValue) {
                        mostValidValue = progress;
                        mostValidIndex = index;
                        actuallyValid = progress > 0.9;
                    }
                }

                // now process the valid index.........
                if (mostValidIndex !== -1) {
                    const [beatTime, beatPosition, entityID] = this._sequence[mostValidIndex];

                    // now fly to this entity and kill him?
                    // we just kill him for now, flying comes later
                    if (!actuallyValid) {
                        this._missed[mostValidIndex] = true;
                    } else {
                        const entity = EntityInformation.getEntity(entityID);
                        if (entity) {
                            entity.kill();
                        }
                    }
                }
            }

            this._deltaTime += dt;
        } else {
            // fade out black overlay very fast, half duration?
            const fadeOutProgress = Math.min(this._fadeOutDeltaTime / this._beatDuration * 2, 1);
            MusicManager.forceSetBassPercentage(1 - fadeOutProgress);
            this._blackOverlaySprite.alpha = 0.5 - fadeOutProgress * 0.5;
            Camera.forceDensity(0.5 + fadeOutProgress * 0.5);
            // alpha is fade out blah blah

            if (this._blackOverlaySprite.alpha === 0) {
                this.destroy();
            }

            this._fadeOutDeltaTime += dt;
        }
    }

    destroy() {
        super.destroy();

        if (this._blackOverlaySprite) {
            this._blackOverlaySprite.destroy();
        }

        if (this._sequenceSprites) {
            for (let i = 0; i < this._sequenceSprites.length; i++) {
                this._sequenceSprites[i][0].destroy();
                this._sequenceSprites[i][1].destroy();
            }
        }
    }

    _getCurrentValidNotes(time) {
        // index matches sequence, I guess
        // [..., [visible, validHit], ...]
        const notes = [];

        for (let i = 0; i < this._sequence.length; i++) {
            const [beatTime, beatPosition, entityID] = this._sequence[i];
            const timeToBeat = Math.max(beatTime - time, 0);
            const progressToBeat = 1 - Math.min(timeToBeat / this._beatDuration, 1);
            const timeAfterBeat = Math.max(time - beatTime, 0);
            const progressAfterBeat = Math.min(timeAfterBeat / this._beatDuration * 16, 1);

            const visible = progressToBeat > 0 && progressAfterBeat < 1;
            const validHit = progressToBeat > 0.8 && progressAfterBeat < 0.5;
            notes.push(visible, validHit);
        }

        return notes;
    }
}