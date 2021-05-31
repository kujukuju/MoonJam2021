class Music {
    _howl;
    _id;
    _playTime;

    _bassHowl;
    _bassID;

    _startOffset;
    _bpm;

    // [[time, name], [time, name], ...]
    _events;

    _lastMouseDown = false;

    _bassPercentage;
    _volume;
    _lastAppliedBassPercentage;

    constructor(howl, labels, bassHowl) {
        this._howl = howl;
        this._id = howl.play();
        this._playTime = 0;

        if (bassHowl) {
            this._bassHowl = bassHowl;
            this._bassID = bassHowl.play();
            this._bassHowl.volume(0, this._bassID);
        }

        this._startOffset = 0;
        this._bpm = 0;
        this._bassPercentage = 0;
        this._lastAppliedBassPercentage = 0;
        this._volume = 1;

        this._events = {};

        this._processLabels(labels);

        this._playTime = Date.now();

        this._howl.once('end', () => {
            if (MusicManager.isStageMusic()) {
                if (EntityInformation.getClientEntity()) {
                    // we don't kill the player if the song has ended but they've killed all entities
                    if (EntityInformation.getEntityCount() > 1) {
                        EntityInformation.getClientEntity().kill();
                    }
                }
            }
        }, this._id);
    }

    update(time, dt) {
        if (!InputManager.mouseDownLeft) {
            this._lastMouseDown = false;
        }

        if (InputManager.mouseDownLeft && !this._lastMouseDown) {
            this._lastMouseDown = true;
        }

        if (this._bassPercentage !== this._lastAppliedBassPercentage) {
            this._lastAppliedBassPercentage = this._bassPercentage;

            if (this._bassHowl) {
                this._applyBassVolume();
            }
        }
    }

    getSound() {
        return [this._howl, this._id];
    }

    getCurrentBeat(time) {
        if (!this._playTime || !this._bpm) {
            return 0;
        }

        const delta = Math.max((time + MusicConstants.CALIBRATION_OFFSET) - (this._playTime + this._startOffset), 0);
        const msPerBeat = 60000 / this._bpm;

        return delta / msPerBeat;
    }

    getApproximateBeatTime(beat) {
        return this._playTime + this._startOffset + this.convertBeatToMilliseconds(beat);
    }

    getApproximateTimeForEvent(count, event) {
        const events = this._events[event];
        if (!events) {
            return 0;
        }

        const currentEvent = events[count];
        if (!currentEvent) {
            return 0;
        }

        return this._playTime + currentEvent * 1000;
    }

    getEventDuration(count, event) {
        const events = this._events[event];
        if (!events) {
            return 0;
        }

        const currentEvent = events[count];
        const nextEvent = events[count + 1];

        if (!nextEvent) {
            return 0;
        }

        return (nextEvent - currentEvent) * 1000;
    }

    setBassPercentage(percentage) {
        this._bassPercentage = percentage;
    }

    getEventTimeAfterTime(time, event) {
        // we don't consider the start here, because the event labels start at offset 0
        const delta = Math.max((time + MusicConstants.CALIBRATION_OFFSET) - this._playTime, 0) / 1000;

        const events = this._events[event];
        if (!events) {
            return 0;
        }

        for (let i = 0; i < events.length; i++) {
            if (delta < events[i] - 0.001) {
                return this._playTime + events[i] * 1000;
            }
        }

        return 0;
    }

    getCurrentEventBeat(time, event) {
        // we don't consider the start here, because the event labels start at offset 0
        const delta = Math.max((time + MusicConstants.CALIBRATION_OFFSET) - this._playTime, 0) / 1000;

        const events = this._events[event];
        if (!events) {
            return 0;
        }

        for (let i = 0; i < events.length; i++) {
            if (delta > events[i]) {
                if (!events[i + 1]) {
                    return i + 1;
                }

                if (delta < events[i + 1]) {
                    // this is the percentage through the event, or beat
                    return (delta - events[i]) / (events[i + 1] - events[i]) + i;
                }
            }
        }

        return 0;
    }

    convertBeatToMilliseconds(beat) {
        if (!this._bpm) {
            return 0;
        }

        const msPerBeat = 60000 / this._bpm;
        return beat * msPerBeat;
    }

    getVolume() {
        return this._volume * this._howl.volume();
    }

    setVolume(volume) {
        this._volume = volume / this._howl.volume();
        this._applyBassVolume();
    }

    getBeatTimeModifier(beat) {
        const EASE_IN_START = 0.8;
        const EASE_IN_END = 0.1;

        const beatFloor = Math.floor(beat);
        const beatMod = beat - beatFloor;
        const easingIn = beatMod < EASE_IN_END || beatMod >= EASE_IN_START;

        if (easingIn) {
            const easeInDuration = (1 - EASE_IN_START) + EASE_IN_END;
            const progress = ((beatMod + (1 - EASE_IN_START)) % 1) / easeInDuration;

            return MathHelper.easeInOutSin(progress);
        } else {
            const easeOutDuration = EASE_IN_START - EASE_IN_END;
            const progress = (beatMod - EASE_IN_END) / easeOutDuration;

            return MathHelper.easeOutInSin(progress);
        }
    }

    isOnBeat(time) {
        const beat = this.getCurrentBeat(time);
        const rounded = Math.round(beat);
        const delta = Math.abs(beat - rounded);

        return this.convertBeatToMilliseconds(delta) < MusicManager.ALLOWED_LENIENCE;
    }

    getMSPerBeat() {
        if (!this._bpm) {
            return 0;
        }

        return 60000 / this._bpm;
    }

    destroy() {
        this._howl.stop(this._id);
        if (this._bassHowl) {
            this._bassHowl.stop(this._bassID);
        }
    }

    _applyBassVolume() {
        if (this._bassHowl) {
            const normalVolume = this._volume * (1 - this._bassPercentage);
            const bassVolume = this._volume * (this._bassPercentage);

            this._howl.volume(normalVolume * this._howl.volume(), this._id);
            this._bassHowl.volume(bassVolume * this._howl.volume(), this._bassID);
        } else {
            this._howl.volume(this._volume * this._howl.volume(), this._id);
        }
    }

    _processLabels(labels) {
        const labelLines = labels.split('\n');
        for (let i = 0; i < labelLines.length; i++) {
            const label = labelLines[i].trim();
            if (label.length === 0) {
                continue;
            }

            const labelParts = label.split('\t');
            const start = Number.parseFloat(labelParts[0]);
            const name = labelParts[2];

            if (name.startsWith('bpm')) {
                const bpm = name.substring(3);
                this._startOffset = start;
                this._bpm = Number.parseFloat(bpm);
            } else {
                if (!this._events[name]) {
                    this._events[name] = [];
                }
                this._events[name].push(start);
            }
        }

        for (const name in this._events) {
            this._events[name].sort((eventA, eventB) => {
                return eventA - eventB;
            });
        }
    }
}