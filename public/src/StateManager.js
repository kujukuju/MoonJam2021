class StateManager {
    static _currentRoom = 0;

    static _showDeathScreenCountdown = 2000;

    static _calibrating = false;
    static _calibrationStartTime = 0;
    static _calibrationOffsetAccumulation = 0;
    static _calibrationHitCount = 0;
    static _calibrationClick = false;
    static _calibrationSoundID = 0;

    static _potentialNextDoorRoom = 0;

    static _enemyCountdownSprite;

    static initialize() {
        document.getElementById('embark').addEventListener('mouseenter', event => {
            // click noise
        });
        document.getElementById('calibrate').addEventListener('mouseenter', event => {
            // click noise
        });

        document.getElementById('embark').addEventListener('click', event => {
            if (MusicConstants.ROOMS[0][0].state() !== 'loaded' || MusicConstants.ROOMS[0][2].state() !== 'loaded') {
                // don't allow to start without music being loaded
                return;
            }

            MusicManager.embark();
            document.getElementById('main-menu').style.display = 'none';
        });

        document.getElementById('die-again-button').addEventListener('click', event => {
            StateManager._restartCurrentRoom();
        });

        document.getElementById('calibrate').addEventListener('click', event => {
            document.getElementById('calibration-screen').style.display = 'block';

            StateManager._beginCalibration();
        });

        StateManager._enemyCountdownSprite = new PIXI.Text('Remaining Enemies: 0', {
            fontFamily: 'meta',
            fontSize: 32,
            fill: 0x000000,
            align: 'left'});
        StateManager._enemyCountdownSprite.position.x = window.innerWidth - 500;
        StateManager._enemyCountdownSprite.position.y = 40;
        StateManager._enemyCountdownSprite.alpha = 0;
        Renderer.staticContainer.addChild(StateManager._enemyCountdownSprite);
    }

    static update(time, dt) {
        if (MusicManager.isStageMusic()) {
            StateManager._enemyCountdownSprite.alpha = Math.min(StateManager._enemyCountdownSprite.alpha + 0.001 * dt, 1);
            let remaining = EntityInformation.getEntityCount();
            if (EntityInformation.getClientEntity()) {
                remaining--;
            }
            StateManager._enemyCountdownSprite.text = 'Remaining Enemies: ' + remaining;
        } else {
            StateManager._enemyCountdownSprite.alpha = Math.max(StateManager._enemyCountdownSprite.alpha - 0.001 * dt, 0);
        }

        if (StateManager._calibrating) {
            if (InputManager.keys['escape']) {
                StateManager._endCalibration();
                return;
            }

            if (StateManager._calibrationStartTime) {
                const currentDeltaTime = Math.max(time - (StateManager._calibrationStartTime + 1000), 0);

                if (currentDeltaTime >= 15000) {
                    StateManager._endCalibration();
                    return;
                }

                if (InputManager.mouseDownLeft && !StateManager._calibrationClick) {
                    StateManager._calibrationClick = true;
                    document.getElementById('calibration-screen').classList.add('hit');

                    // process click here
                    const msPerBeat = 60000 / 125;
                    const beat = currentDeltaTime / msPerBeat;
                    const beatInteger = Math.round(beat);
                    const beatMilliseconds = beatInteger * msPerBeat;
                    const offset = beat * msPerBeat - beatMilliseconds;
                    StateManager._calibrationOffsetAccumulation -= offset;
                    StateManager._calibrationHitCount++;
                }

                if (StateManager._calibrationClick && !InputManager.mouseDownLeft) {
                    StateManager._calibrationClick = false;
                    document.getElementById('calibration-screen').classList.remove('hit');
                }
            }

            return;
        }

        if (!EntityInformation.getClientEntity() && MusicManager.isStageMusic()) {
            StateManager._showDeathScreenCountdown = Math.max(StateManager._showDeathScreenCountdown - dt, 0);
            MusicManager.nextSong('none');
        } else if (StateManager._showDeathScreenCountdown < 2000) {
            StateManager._showDeathScreenCountdown = Math.max(StateManager._showDeathScreenCountdown - dt, 0);
        }

        if (EntityInformation.getClientEntity()) {
            document.getElementById('death-screen').style.display = 'none';
            StateManager._showDeathScreenCountdown = 2000;
        } else if (StateManager._showDeathScreenCountdown === 0) {
            if (MusicManager.getCurrentRoomName() !== 'death') {
                MusicManager.nextSong('death');
            }
            document.getElementById('death-screen').style.display = 'block';
            return;
        }

        const beat = MusicManager.getCurrentBeat(time);
        if (beat > 10 && EntityInformation.getEntityCount() === 1 && EntityInformation.getClientEntity()) {
            // you've killed all the entities
            if (StateManager._currentRoom >= StateManager._potentialNextDoorRoom) {
                StateManager._potentialNextDoorRoom++;

                console.log('opening doors for room ', StateManager._currentRoom);
                LevelManager.level.openDoorsForRoom(StateManager._currentRoom);

                if (StateManager._currentRoom === 0) {
                    GateManager.openGate1();
                } else if (StateManager._currentRoom === 1) {
                    GateManager.openGate2();
                } else if (StateManager._currentRoom === 2) {
                    GateManager.openGate3();
                }
            }
        }

        if (EntityInformation.getClientEntity()) {
            const position = EntityInformation.getClientEntity().getPosition();
            const room = LevelManager.level.getNextAreaRoom(position);
            if (Number.isInteger(room)) {
                if (room > StateManager._currentRoom) {
                    StateManager._continueRoom(room);
                }
            }
        }
    }

    static getCurrentRoom() {
        return StateManager._currentRoom;
    }

    static onMusicChange() {
        if (MusicManager.getCurrentRoomName() === 'calibration') {
            StateManager._calibrationStartTime = Date.now();
        } else if (MusicManager.isStageMusic()) {
            if (!EntityInformation.getClientEntity()) {
                // this means were restarting
                EntityInformation.initialize();
                LevelManager.level.reset();
            }
        }

        if (EntityInformation.getClientEntity()) {
            EntityInformation.getClientEntity().clearMouseDown();
        }
    }

    static _restartCurrentRoom() {
        // how tf do I do this?
        // well here we go
        EntityInformation.destroyAllEntities();
        AbilityInformation.destroyAllAbilities();
        LevelManager.level.resetBeat();
        ChargeManager.reset();

        if (EntityInformation.getClientEntity()) {
            EntityInformation.getClientEntity().clearMouseDown();
        }

        MusicManager.nextSong(StateManager._currentRoom);
    }

    static _continueRoom(room) {
        MusicManager.nextSong(room);

        if (EntityInformation.getClientEntity()) {
            EntityInformation.getClientEntity().clearMouseDown();
        }
        LevelManager.level.resetBeat();

        StateManager._currentRoom = room;
    }

    static _beginCalibration() {
        StateManager._calibrating = true;
        StateManager._calibrationStartTime = 0;
        StateManager._calibrationOffsetAccumulation = 0;
        StateManager._calibrationHitCount = 0;
        StateManager._calibrationClick = false;

        // timeout here?
        MusicManager.nextSong('calibration');
    }

    static _endCalibration() {
        MusicManager.nextSong('title');
        StateManager._calibrationSoundID = 0;

        StateManager._calibrating = false;
        document.getElementById('calibration-screen').style.display = 'none';
        document.getElementById('calibration-screen').classList.remove('hit');

        document.getElementById('calibration-result-screen').style.display = 'block';
        const offset = StateManager._calibrationHitCount ? (StateManager._calibrationOffsetAccumulation / StateManager._calibrationHitCount) : 0;

        window.localStorage.setItem('calibration', String(offset));
        MusicConstants.CALIBRATION_OFFSET = offset;

        if (offset >= 0) {
            document.getElementById('calibration-result-text').innerText = 'Calibration: ' + Math.abs(offset / 2).toFixed(2) + ' ms early.';
        } else {
            document.getElementById('calibration-result-text').innerText = 'Calibration: ' + Math.abs(offset / 2).toFixed(2) + ' ms late.';
        }

        setTimeout(() => {
            document.getElementById('calibration-result-screen').style.display = 'none';
        }, 4000);
    }
}