/***
 * file name : AudioPlayer.js
 * description : AudioPlayer class
 * create date : 2018-05-17
 * creator : saltgamer
 * reference: https://github.com/YuriFA/audio_player
 ***/
import Playlist from './Playlist';
import EventEmmiter from '../utils/EventEmmiter';

export default class AudioPlayer extends EventEmmiter {
    constructor(tracks = [], settings = {}) {
        super();

        this.playlist = new Playlist(tracks);
        this.muted = false;
        this.currentTrackIndex = 0;
        this.settings = settings;
        this._playback = {};
        this._resetPlaybackInfo();
        this._setTrack();

    }

    get isPlaying() {
        return this._playback.playing;
    }

    get isPaused() {
        return this._playback.track && this._playback.track.paused;
    }

    get volume() {
        return this._gain.gain.value;
    }

    set volume(value) {
        if (value > 1 && value < 0) {
            throw Error('-> Volume must be in range from 0 to 1');
        }
        if (value === 0) {
            this.mute();
        } else if (this.muted) {
            this.unmute();
        }
        this._gain.gain.value = value;
    }

    play(id = null) {
        if (this.isPlaying) {
            return this;
        }

        this.currentTrackIndex = id || this.currentTrackIndex;

        if (!this._playback.track || this._playback.track.id !== this.currentTrackIndex) {
            this._setTrack();
        }

        const track = this._playback.track;
        console.log(`-> Playing track id=${this.currentTrackIndex} - ${track.src}`);

        if (track.audio && track.isBuffered()) {
            track.audio.play();
            this._playback.playing = true;
        } else {
            track.load();

            track.on('canplay', this._startPlayback.bind(this));
            track.on('ended', this.stop.bind(this));
            track.on('ended', (event) => {
                this.emit('track:ended', event);
            });
            track.on('progress', (event) => {
                this.emit('track:progress', event);
            });
            track.on('loadeddata', (event) => {
                this.emit('track:loadeddata', event);
            });
            track.on('canplaythrough', (event) => {
                this.emit('track:canplaythrough', event);
            });
            track.on('loadedmetadata', (event) => {
                this.emit('track:loadedmetadata', event);
            });
            track.on('timeupdate', (event) => {
                this.emit('track:timeupdate', event);
            });

        }

        return this;
    }

    stop() {
        this._playback.playing = false;
        const track = this._playback.track;
        track.audio.pause();
        track.audio.currentTime = 0;


        return this;
    }

    pause() {
        this._playback.playing = false;
        const track = this._playback.track;
        track.audio.pause();
        console.log('-> PAUSED');
        return this;
    }

    mute() {
        this._playback.track.muted = true;
        this.muted = true;

        return this;
    }

    unmute() {
        this._playback.track.muted = false;
        this.muted = false;

        return this;
    }

    playNext() {
        if (this.isPlaying) {
            this.stop();
        }
        this._resetPlaybackInfo();

        this.currentTrackIndex += 1;
        this.play();

        return this;
    }

    playPrev() {
        if (this.isPlaying) {
            this.stop();
        }
        this._resetPlaybackInfo();

        this.currentTrackIndex -= 1;
        this.play();

        return this;
    }

    rewind(ratio) {
        if (ratio > 1 && ratio < 0) {
            throw Error('To rewind audio, ratio must be in range from 0 to 1');
        }

        const audio = this._playback.track.audio;
        if (!isNaN(audio.duration)) {
            const newTime = audio.duration * ratio;
            audio.currentTime = newTime;
        }

        return this;
    }

    _setTrack() {
        if (this.isPlaying) {
            return this;
        }
        console.log('-> Setting track', this.currentTrackIndex);
        // TODO: need to refactoring this
        try {
            this._playback.track = this.playlist.getTrack(this.currentTrackIndex);
        } catch (error) {
            console.log(error);
            console.log('-> CurrentTrackIndex reseted to 0');
            this.currentTrackIndex = 0;
            this._playback.track = this.playlist.getTrack(this.currentTrackIndex);
        }

        return this;
    }

    _resetPlaybackInfo() {
        this._playback = {
            track: null,
            source: null,
            playing: false,
        };
        // console.log('RESET PLAYBACK');

        return this;
    }

    _startPlayback() {
        if (this.isPlaying) {
            console.log('->> Already playing!');
            return this;
        }

        const playback = this._playback;
        const track = this._playback.track;

        console.log(`Loaded - ${playback.track.src}`);
        playback.playing = true;
        track.audio.play();

        // Unsubscribe because 'canplay' event triggered by changing the current time
        track.off('canplay', this._startPlayback.bind(this));

        return this;
    }



}