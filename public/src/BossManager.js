class BossManager {
    static BOSS_POSITION = [
        -3616.00,
        14897.00,
    ];

    static STATUE_POSITIONS = [
        [-2496.00, 14222.00],
        [-2496.00, 15586.00],
        [-1838.00, 14222.00],
        [-1838.00, 15586.00],
        [-1170.00, 14222.00],
        [-1170.00, 15586.00],
    ];

    static POTENTIAL_SPAWNS = [
        [-3616.00, 14897.00],
        [-3650.00, 14242.00],
        [-3644.00, 15648.00],
        [-1140.00, 15392.00],
        [-1140.00, 14626.00],
    ];

    static BAT_POSITIONS = [
        [-3612.00, 14209.00],
        [-3612.00, 15655.00],
        [-3461.00, 14209.00],
        [-3461.00, 15655.00],
        [-3306.00, 14209.00],
        [-3306.00, 15655.00],
        [-3142.00, 14209.00],
        [-3142.00, 15655.00],
        [-2985.00, 14209.00],
        [-2985.00, 15655.00],
        [-2833.00, 14209.00],
        [-2833.00, 15655.00],
        [-2630.00, 14209.00],
        [-2630.00, 15655.00],
        [-2436.00, 14209.00],
        [-2436.00, 15655.00],
        [-2264.00, 14209.00],
        [-2264.00, 15655.00],
        [-2106.00, 14209.00],
        [-2106.00, 15655.00],
    ];

    static _deltaTime = 0;

    static _forcedDensity = 1;

    static _spawnedBoss = false;
    static _phase = 0;
    static _phaseDeltaTime = 0;

    static _batSpawnIndex = 0;
    static _lastBatSpawnBeat = 0;

    static _spawnDelayCountdown = 0;

    static _lastBulletSpawnBeat = 0;
    static _bulletSpawnCount = 0;

    static _spawnedStatues = false;

    static _currentBoss = null;

    static update(time, dt) {
        if (StateManager.getCurrentRoom() !== 4) {
            return;
        }

        const clientEntity = EntityInformation.getClientEntity();
        if (!clientEntity) {
            return;
        }

        BossManager._spawnDelayCountdown = Math.max(BossManager._spawnDelayCountdown - dt, 0);

        if (!BossManager._spawnedBoss && BossManager._spawnDelayCountdown === 0 && this._phase < 5) {
            BossManager._spawnedBoss = true;

            const bossEntity = new BossEntity();
            if (BossManager._phase === 0) {
                bossEntity.setPosition(BossManager.BOSS_POSITION[0], BossManager.BOSS_POSITION[1]);
            } else {
                const spawn = BossManager._chooseBossSpawn();
                bossEntity.setPosition(spawn[0], spawn[1]);
            }
            EntityInformation.addEntity(bossEntity);

            BossManager._currentBoss = bossEntity;

            if (BossManager._phase > 0) {
                bossEntity.setFoundTarget();
            }

            if (this._phase === 0) {
                AbilityInformation.addAbility(new BossText(bossEntity, BossText.WELCOME_TEXTURE));
            } else if (this._phase === 1) {
                AbilityInformation.addAbility(new BossText(bossEntity, BossText.IMMORTAL_TEXTURE));
            } else if (this._phase === 2) {
                AbilityInformation.addAbility(new BossText(bossEntity, BossText.WHEN_LEARN_TEXTURE));
            }

            // for (let i = 0; i < BossManager.STATUE_POSITIONS.length; i++) {
            //     const statuePos = BossManager.STATUE_POSITIONS[i];
            //
            //     const statueEntity = new
            // }
        }

        BossManager._phaseDeltaTime += dt;
        if (this._phase === 2) {
            if (BossManager._batSpawnIndex * 2 < BossManager.BAT_POSITIONS.length) {
                if (BossManager._phaseDeltaTime > MusicManager.convertBeatToMilliseconds(2)) {
                    const floorBeat = Math.floor(MusicManager.getCurrentBeat(time));
                    if (floorBeat > BossManager._lastBatSpawnBeat) {
                        BossManager._lastBatSpawnBeat = floorBeat;

                        const pos1 = BossManager.BAT_POSITIONS[BossManager._batSpawnIndex * 2];
                        const ent1 = new BossBatEntity();
                        ent1.setPosition(pos1[0], pos1[1]);
                        ent1.setFoundTarget();
                        EntityInformation.addEntity(ent1);

                        const pos2 = BossManager.BAT_POSITIONS[BossManager._batSpawnIndex * 2 + 1];
                        const ent2 = new BossBatEntity();
                        ent2.setPosition(pos2[0], pos2[1]);
                        ent2.setFoundTarget();
                        EntityInformation.addEntity(ent2);

                        BossManager._batSpawnIndex++;
                    }
                }
            }
        } else if (this._phase === 3) {
            // now statues moon2W
            if (!BossManager._spawnedStatues) {
                BossManager._spawnedStatues = true;

                for (let i = 0; i < BossManager.STATUE_POSITIONS.length; i++) {
                    const pos = BossManager.STATUE_POSITIONS[i];
                    const ent = new StatueEntity();
                    ent.setPosition(pos[0], pos[1]);
                    ent.setFoundTarget();
                    EntityInformation.addEntity(ent);
                }
            }
        } else if (this._phase === 4) {
            // now bullet hell moon2W
            if (BossManager._phaseDeltaTime > MusicManager.convertBeatToMilliseconds(2)) {
                const floorBeat = Math.floor(MusicManager.getCurrentBeat(time) * 2);
                if (floorBeat > BossManager._lastBulletSpawnBeat) {
                    BossManager._lastBulletSpawnBeat = floorBeat;

                    if (BossManager._bulletSpawnCount >= 40) {
                        BossManager._bulletSpawnCount = 0;
                    }

                    if (BossManager._currentBoss) {
                        const bossPosition = BossManager._currentBoss.getPosition();
                        const playerPosition = EntityInformation.getClientEntity().getPosition();

                        if (BossManager._bulletSpawnCount < 30) {
                            const progress = BossManager._bulletSpawnCount / 29;
                            const toPlayer = Math.atan2(playerPosition[1] - bossPosition[1], playerPosition[0] - bossPosition[0]);
                            const angle = toPlayer + Math.sin(progress * Math.PI * 4) * Math.PI / 3;
                            const startPos = [
                                bossPosition[0] + Math.cos(angle) * 80,
                                bossPosition[1] + Math.sin(angle) * 80,
                            ];
                            const velocity = [
                                Math.cos(angle) * 1.5,
                                Math.sin(angle) * 1.5,
                            ];
                            const bullet = new BossBullet(startPos, velocity);
                            AbilityInformation.addAbility(bullet);
                        }

                        BossManager._bulletSpawnCount++;
                    }
                }
            }
        } else if (this._phase === 5) {

        }

        if (BossManager._deltaTime < 8000) {
            // zoom out and freeze everything
            if (BossManager._deltaTime < 1000) {
                BossManager._forcedDensity = Math.max(BossManager._forcedDensity - dt * 0.001, 0.5);
            } else if (BossManager._deltaTime > 7000) {
                BossManager._forcedDensity = Math.min(BossManager._forcedDensity + dt * 0.001, 1);
            }

            clientEntity.setForcedAccelMul(0);
            Camera.forceDensity(BossManager._forcedDensity);
        } else if (BossManager._phase === 0) {
            if (BossManager._currentBoss) {
                BossManager._currentBoss.setFoundTarget();
            }
        }

        BossManager._deltaTime += dt;
    }

    static kill() {
        if (BossManager._phase === 4) {
            const finalText = new BossText(BossManager._currentBoss, BossText.CURSE_YOU_TEXTURE);
            finalText.forceDuration(6000);
            AbilityInformation.addAbility(finalText);
        }

        BossManager._currentBoss = null;
        BossManager._phase++;
        BossManager._phaseDeltaTime = 0;
        BossManager._spawnedBoss = false;
        BossManager._spawnDelayCountdown = MusicManager.convertBeatToMilliseconds(2);

        if (BossManager._phase === 5) {
            MusicManager.nextSong('end');

            EntityInformation.destroyAllEntitiesExceptYou();
        }
    }

    static reset() {
        BossManager._deltaTime = 0;
        BossManager._spawnedBoss = false;
        BossManager._phase = 0;
        BossManager._phaseDeltaTime = 0;
        BossManager._batSpawnIndex = 0;
        BossManager._lastBatSpawnBeat = 0;
        BossManager._spawnDelayCountdown = 0;
        BossManager._currentBoss = null;
        BossManager._lastBulletSpawnBeat = 0;
        BossManager._bulletSpawnCount = 0;
        BossManager._spawnedStatues = false;
    }

    static canUseAbilities() {
        return StateManager.getCurrentRoom() !== 4 || BossManager._deltaTime > 8000;
    }

    static _chooseBossSpawn() {
        const clientEntity = EntityInformation.getClientEntity();
        if (!clientEntity) {
            return BossManager.POTENTIAL_SPAWNS[0];
        }

        const clientPos = clientEntity.getPosition();

        let bestDistance = 0;
        let bestSpawn = null;
        for (let i = 0; i < BossManager.POTENTIAL_SPAWNS.length; i++) {
            const spawn = BossManager.POTENTIAL_SPAWNS[i];
            const delta = [
                spawn[0] - clientPos[0],
                spawn[1] - clientPos[1],
            ];
            const distance = MathHelper.magnitude(delta);
            if (distance > bestDistance) {
                bestDistance = distance;
                bestSpawn = spawn;
            }
        }

        return bestSpawn ?? BossManager.POTENTIAL_SPAWNS[0];
    }
}