class MusicManager {
    static ALLOWED_LENIENCE = 80;

    static music;
    static _lastBeat;

    static _currentRoomName;
    static _queuedSong;
    static _queuedName;

    static _bassShift = 0;

    static initialize() {
        MusicManager.nextSong('title');
    }

    static embark() {
        MusicManager.nextSong(0);
        MusicManager._lastBeat = 0;
    }

    static update(time, dt) {
        // if there is a queued song it is fading out
        if (MusicManager._queuedSong) {
            if (MusicManager.music) {
                const nextVolume = Math.max(MusicManager.music.getVolume() - dt * 0.0004, 0);
                if (nextVolume === 0) {
                    MusicManager.music.destroy();
                    MusicManager.music = null;
                } else {
                    MusicManager.music.setVolume(nextVolume);
                }
            }

            if (!MusicManager.music) {
                if (MusicManager._queuedSong.length > 0) {
                    MusicManager.music = new Music(MusicManager._queuedSong[0], MusicManager._queuedSong[1], this._queuedSong[2] ?? null);
                }
                MusicManager._currentRoomName = MusicManager._queuedName;
                MusicManager._queuedSong = null;

                StateManager.onMusicChange();
            }
        }
        // I could else then raise volume here, that would be an edge case if a queued song gets added then removed
        // but I dont think that's possible in this simple game

        if (MusicManager.music) {
            MusicManager.music.setBassPercentage(MusicManager._bassShift);
            MusicManager.music.update(time, dt);
        }

        MusicManager._lastBeat = MusicManager.getCurrentBeat(time);

        MusicManager._bassShift = 0;
    }

    static getSound() {
        if (!MusicManager.music) {
            return null;
        }

        return MusicManager.music.getSound();
    }

    static isStageMusic() {
        return Number.isInteger(MusicManager._currentRoomName);
    }

    static getCurrentRoomName() {
        return MusicManager._currentRoomName;
    }

    static getEventTimeAfterTime(time, event) {
        if (!MusicManager.music) {
            return 0;
        }

        return MusicManager.music.getEventTimeAfterTime(time, event);
    }

    static getPercentIncorrectBeat(beat) {
        if (!MusicManager.music) {
            return 0;
        }

        // returns 0 if you hit this beat perfectly
        // returns 1 if you were at the maximum allowed offset
        const roundedBeat = Math.round(beat);
        const delta = MusicManager.music.convertBeatToMilliseconds(Math.abs(beat - roundedBeat));

        return Math.min(delta / MusicManager.ALLOWED_LENIENCE, 1);
    }

    static nextSong(room) {
        if (!MusicConstants.ROOMS[room]) {
            console.error('Invalid room index. ', room);
            return;
        }

        MusicManager._queuedName = room;
        MusicManager._queuedSong = MusicConstants.ROOMS[room];
    }

    static getMSPerBeat() {
        if (!MusicManager.music) {
            return 0;
        }

        return MusicManager.music.getMSPerBeat();
    }

    static isOnBeat(time) {
        if (!MusicManager.music) {
            return false;
        }

        return MusicManager.music.isOnBeat(time);
    }

    static getCurrentBeat(time) {
        if (!MusicManager.music) {
            return 0;
        }

        return MusicManager.music.getCurrentBeat(time);
    }

    static getTimeFromBeat(beat) {
        if (!MusicManager.music) {
            return 0;
        }

        return MusicManager.music.getTimeFromBeat(beat);
    }

    static forceSetBassPercentage(percent) {
        MusicManager._bassShift = percent;
    }

    static getApproximateBeatTime(beat) {
        if (!MusicManager.music) {
            return 0;
        }

        return MusicManager.music.getApproximateBeatTime(beat);
    }

    static getApproximateTimeForEvent(count, event) {
        if (!MusicManager.music) {
            return 0;
        }

        return MusicManager.music.getApproximateTimeForEvent(count, event);
    }

    static getEventDuration(count, event) {
        if (!MusicManager.music) {
            return 0;
        }

        return MusicManager.music.getEventDuration(count, event);
    }

    static getCurrentEventBeat(time, event) {
        if (!MusicManager.music) {
            return 0;
        }

        return MusicManager.music.getCurrentEventBeat(time, event);
    }

    static convertBeatToMilliseconds(beat) {
        if (!MusicManager.music) {
            return 0;
        }

        return MusicManager.music.convertBeatToMilliseconds(beat);
    }

    static getBeatTimeModifier(beat) {
        if (!MusicManager.music) {
            return 0;
        }

        return MusicManager.music.getBeatTimeModifier(beat);
    }
}