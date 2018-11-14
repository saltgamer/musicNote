/***
 * file name : NoteSync.js
 * description : NoteSync class
 * create date : 2018-05-18
 * creator : saltgamer
 ***/
import {$qs} from '../utils';
import StateMachine from '../FSM';

export default class NoteSync {
    constructor(syncInfo) {
        // this.svgElement = document.querySelector('#' + syncInfo.svgs[0]);
        this.svgs = syncInfo.svgs;
        this.svgElement = document;
        this.noteKey = syncInfo.noteKey;
        this.fillColor = syncInfo.fillColor;
        this.startTime = syncInfo.start;
        this.endTime = syncInfo.end;
        this.noteCount = syncInfo.noteSyncData.length;
        this.noteSyncData = syncInfo.noteSyncData;
        this.speedAdjust = syncInfo.speedAdjust;

        this.mode = syncInfo.mode;
        this.currentPick = 'song'; // song, mr, repeat

        this.currentTime = 0;
        this.currentIndex = 0;
        this.currentNote = this.noteKey + '001';
        this.currentSpeed = 1.0;

        this.player = null;

        this.beat = ((this.endTime - this.startTime) / this.noteCount) + this.speedAdjust;

        if (syncInfo.bridge) this.initBridge(syncInfo.bridge);


        this.initNote();
        this.initSync();

        console.log('-> noteCount: ', this.noteCount);
        console.log('-> beat: ', this.beat);

        this.syncPause = false;
        this.noteMap = new Map();
        // this.playedNote = new Map();


        this.onScroll = false;

        this.sections = syncInfo.sections;
        this.currentSection = 1;
        this.sectionEnd = this.endTime;

        this.sectionPlay = false;

        this.loopMode = false;

        this.initNoteMap();
        console.log('--> noteMap: ', this.noteMap);

        this.hideSyllable();

        // this.repeatInit();

        console.log('~~~> this: ', this);

    }

    initSync() {
        this.currentSyncStart = this.startTime;
        this.currentSyncEnd = this.startTime + (this.noteSyncData[this.currentIndex] * this.beat);
    }

    initNoteMap() {
        let _start = this.startTime,
            _end = this.startTime + (this.noteSyncData[0] * this.beat);

        this.noteSyncData.forEach((value, idx) => {
            const target = this.getNoteId(idx);

            _start = (idx === 0 ? _start : _end);
            _end = (idx === 0 ? _end : _end + (this.noteSyncData[idx] * this.beat));

            let isBridge = false,
                interval = 0;

            if (this.bridge) {
                for (let i = 0; i < this.bridge.length; i++) {
                    if (this.isBridegNote(target, this.bridge[i].startNote, this.bridge[i].endNote)) {
                        console.log('--> isBridegNote: ', target);
                        /*   _start = _start + this.bridge[i].interval;
                           _end = _end + this.bridge[i].interval;*/
                        isBridge = true;
                        interval = this.bridge[i].interval;
                    }
                }
            }

            // console.log('------_start: ', _start);
            this.noteMap.set(target, {
                element: this.svgElement.querySelector('#' + target),
                target: target,
                index: idx,
                duration: value,
                syncStart: (isBridge ? _start + interval : _start),
                syncEnd: (isBridge ? _end + interval : _end),
                section: this.getCurrentSection(target)
            });

        });

        if (this.mode === 'split') {
            this.showSVG([1, 2]);
        } else {
            this.showAllSVG();
        }

    }

    initNote() {
        let index = 0;
        this.svgs.forEach((value, idx) => {
            const svgElement = document.querySelector('#' + value);
            const bar = svgElement.querySelector('#bar_' + (idx + 1));

            for (let i = 0; i < bar.childNodes.length; i++) {
                if (bar.childNodes[i].nodeName !== '#text' && bar.childNodes[i].getAttribute('pass') !== 'true') {
                    bar.childNodes[i].setAttribute('id', this.getNoteId(index));
                    bar.childNodes[i].setAttribute('svgId', idx + 1);
                    index++;
                }
            }
        });
    }

    initSection() {

        const start = this.sections[this.currentSection - 1];
        console.log('- start: ', start);
        console.log(this.noteMap.get(start));

        const end = this.getPrevNoteId(this.sections[this.currentSection]);
        console.log('-end: ', end);
        console.log(this.noteMap.get(end));

        const startNote = this.noteMap.get(start);
        const endNote = this.noteMap.get(end);

        this.currentIndex = startNote.index;
        this.currentTime = startNote.syncStart;
        this.sectionEnd = endNote.syncEnd;
        /*  this.currentSyncStart = startNote.syncStart;
          this.currentSyncEnd = startNote.syncEnd;*/

        this.player.move(this.currentTime);
        this.changeSync(this.currentTime);

    }

    showSVG(index) {
        console.log('--------------showSVG:', index);
        this.svgs.forEach((value, idx) => {
            this.svgElement.querySelector('#' + value).style.display = 'none';
        });

        index.forEach(value => {
            const svg = this.svgElement.querySelector('#' + this.svgs[value - 1]);
            if (svg) {
                svg.style.display = 'block';
            }

        });

    }

    changeSVG() {
        this.showSVG(this.getSectionGroup());
    }

    showAllSVG() {
        this.svgs.forEach((value, idx) => {
            this.svgElement.querySelector('#' + value).style.display = 'block';
        });
    }

    getSectionGroup() {
        const note = this.noteMap.get(this.currentNote);
        // console.log('- section: ', section % 2);
        const svgId = parseInt($qs('#' + note.target).getAttribute('svgId'), 10);

        if (svgId % 2 === 1) {
            return [svgId, svgId + 1];
        } else {
            return [svgId - 1, svgId];
        }

    }

    getCurrentSection(noteId) {
        let start, end, currentNote, result;
        // this.svgs.forEach((value, idx) => {
        /* this.sections.forEach((value, idx) => {
             start = value;
             end = this.getPrevNoteId(this.sections[idx + 1]);

             start = start.split('_')[1];
             end = end.split('_')[1];
             currentNote = noteId.split('_')[1];

              console.log('--------------------------------------------');
              console.log('- noteId: ', noteId);
              console.log('- start: ', start);
              console.log('- end: ', end);
              console.log('--------------------------------------------');

             if (parseInt(start) <= parseInt(currentNote) && parseInt(end) >= parseInt(currentNote)) {
                 result = idx + 1;
             }
         });*/

        for (let i = 0; i < this.sections.length - 1; i++) {
            start = this.sections[i];
            end = this.getPrevNoteId(this.sections[i + 1]);

            start = start.split('_')[1];
            end = end.split('_')[1];
            currentNote = noteId.split('_')[1];

            /*  console.log('--------------------------------------------');
              console.log('- noteId: ', noteId);
              console.log('- start: ', start);
              console.log('- end: ', end);
              console.log('--------------------------------------------');*/

            if (parseInt(start) <= parseInt(currentNote) && parseInt(end) >= parseInt(currentNote)) {
                result = i + 1;
            }
        }
        return result;

    }

    updateSync() {
        this.currentIndex++;
        this.currentSyncStart = this.currentSyncEnd;
        this.currentSyncEnd += this.noteSyncData[this.currentIndex] * this.beat;

        if (this.bridge) {
            for (let i = 0; i < this.bridge.length; i++) {
                if (this.getNoteId(this.currentIndex) === this.bridge[i].startNote) {
                    this.currentSyncStart += this.bridge[i].interval;
                    this.currentSyncEnd += this.bridge[i].interval;
                }
            }
        }

        console.log('-----------------------updateSync----------------------');
        console.log('- currentSyncStart: ', this.currentSyncStart);
        console.log('- currentSyncEnd: ', this.currentSyncEnd);
        console.log('- syncData: ', this.noteSyncData[this.currentIndex]);
        console.log('- duration: ', this.noteSyncData[this.currentIndex] * this.beat);

    }

    startSync(player) {
        this.player = player;

        this.sectionEnd = this.endTime;
        this.render();
    }

    noteChecker() {

        if (this.currentTime >= this.currentSyncStart) {
            console.log('- currentSyncStart: ', this.currentSyncStart);
            console.log('- onSymbol: ', this.getNoteId(this.currentIndex));
            this.onSymbol(this.getNoteId(this.currentIndex));
        }

        if (this.currentTime >= this.currentSyncEnd) {
            console.log('- currentSyncEnd: ', this.currentSyncEnd);
            this.offSymbol(this.getNoteId(this.currentIndex));
            this.updateSync();

            /* if (this.currentPick === 'repeat') {
                 this.repeatCheck(this.getNoteId(this.currentIndex));
             }*/

        }

        // console.log('~> currentTime: ', this.currentTime);
        // console.log('~> sectionEnd: ', this.sectionEnd);
        if (this.currentTime >= this.sectionEnd) {
            this.player.element.play.className = 'controlsPlayButton';
            this.player.stop();
            this.endSync();

            if (this.currentPick === 'repeat') {
                this.repeatSessionCheck();
            }

            /*   if (this.currentPick === 'repeat') {
                   this.player.selectTrack(3);
                   this.player.play();
                   this.syncPause = false;
                   this.startSync(this.player);

                   this.initSection();
                   this.player._playback.track.audio.playbackRate = this.currentSpeed;

                   this.repeat.repeatPlay = true;

                   this.repeatCheck();

               }*/

        }

        if (this.noteMap.get(this.currentNote)) {
            if (this.mode === 'split') {
                this.changeSVG();
            }
        }


    }

    onSymbol(target) {

        const targetElement = this.svgElement.querySelector('#' + target);
        if (targetElement) {
            targetElement.style.fill = this.fillColor;

            if (this.mode === 'scroll' && !this.onScroll) {

                setTimeout(() => {
                    window.location = '#' + target;
                }, 100);
            }
        }
        this.currentNote = target;

        /* this.playedNote.set(target, {
             element: this.svgElement.querySelector('#' + target),
             target: target,
             index: this.currentIndex,
             duration: this.noteSyncData[this.currentIndex] * this.beat,
             syncStart: this.currentSyncStart,
             syncEnd: this.currentSyncEnd
         });*/
    }

    offSymbol(target) {
        this.svgElement.querySelector('#' + target).style.fill = '#000';
    }

    getNoteId(syncIndex) {
        let index = syncIndex + 1;
        if (index < 10) {
            index = this.noteKey + '00' + index;
        } else if (index < 100) {
            index = this.noteKey + '0' + index;
        } else {
            index = this.noteKey + index;
        }

        return index;
    }

    getPrevNoteId(noteId) {
        // console.log('--> getPrevNoteId: ', noteId);
        const note = noteId.split('_')[1];
        // console.log('-note: ', note);
        return this.getNoteId(note - 2);

    }

    changeSync(time) {
        if (!this.player) {
            return;
        }
        this.clearNote();

        if (time) {
            this.currentTime = time;
        } else {
            this.currentTime = this.player._playback.track.audio.currentTime;
        }
        console.log('-----------------------changeSync----------------------');
        console.log('- currentTime: ', this.currentTime);
        this.currentIndex = 0;
        this.initSync();

        this.moveSync();

        // console.log('- playedNote: ', this.playedNote);

        /*   console.log('- currentIndex: ', this.currentIndex);
           console.log('- currentSyncStart: ', this.currentSyncStart);
           console.log('- currentSyncEnd: ', this.currentSyncEnd);
           console.log('- syncData: ', this.noteSyncData[this.currentIndex]);
           console.log('- duration: ', this.noteSyncData[this.currentIndex] * this.beat);*/

    }

    moveSync() {
        this.noteMap.forEach(value => {
            if (value.syncStart <= this.currentTime && value.syncEnd > this.currentTime) {
                this.moveNote(value);
            }
        });
    }

    endSync() {
        this.syncPause = true;
        this.currentIndex = 0;
        this.initSync();
        this.clearNote();
        this.currentNote = this.noteKey + '001';
        if (this.mode === 'split') {
            this.changeSVG();
        }

    }

    moveNote(value) {
        console.log('==============moveSync==================');
        this.onSymbol(value.target);
        this.currentIndex = value.index;
        this.currentSyncStart = value.syncStart;
        this.currentSyncEnd = value.syncEnd;


    }

    render() {

        this.currentTime = this.player._playback.track.audio.currentTime;
        console.log('~* currentTime: ', this.currentTime);

        this.noteChecker();

        this.countChecker();

        /*  if (this.currentPick === 'repeat') {

              this.repeatSessionCheck();
          }*/

        this.onScroll = false;

        if (!this.syncPause || this.player._playback.playing) {
            setTimeout(() => {
                window.requestAnimationFrame(this.render.bind(this));
            }, 1000 / 20);

        }

    }

    clearNote() {
        this.noteMap.forEach(value => {
            // console.log(value);
            value.element.style.fill = '#000';
        });
    }

    showLyrics() {
        this.svgs.forEach((value, idx) => {
            const svgElement = this.svgElement.querySelector('#' + value);
            svgElement.querySelector('#lyrics_' + (idx + 1)).style.display = 'block';
        });

    }

    hideLyrics() {
        this.svgs.forEach((value, idx) => {
            const svgElement = this.svgElement.querySelector('#' + value);
            svgElement.querySelector('#lyrics_' + (idx + 1)).style.display = 'none';
        });

    }

    showSyllable() {
        this.svgs.forEach((value, idx) => {
            const svgElement = this.svgElement.querySelector('#' + value);
            svgElement.querySelector('#syllable_' + (idx + 1)).style.display = 'block';
        });
    }

    hideSyllable() {
        this.svgs.forEach((value, idx) => {
            const svgElement = this.svgElement.querySelector('#' + value);
            svgElement.querySelector('#syllable_' + (idx + 1)).style.display = 'none';
        });
    }

    initBridge(bridge) {
        this.bridge = [];

        bridge.forEach((value) => {
            this.bridge.push({
                interval: value.end - value.start,
                startNote: value.startNote,
                endNote: value.endNote
            });

        });

        console.log('--> bridge: ', this.bridge);

    }

    isBridegNote(target, startNote, endNote) {
        let isBridge = false;
        target = target.replace(this.noteKey, '');
        startNote = startNote.replace(this.noteKey, '');
        endNote = endNote.replace(this.noteKey, '');

        if (startNote <= target && endNote >= target) {
            isBridge = true;
        }

        return isBridge;
    }

    countChecker() {

        const countBox = $qs('.countBox');

        if ((this.startTime - 3) <= this.currentTime && (this.startTime - 2) >= this.currentTime) {
            // console.log('#################################---> count 3 ##################################');
            countBox.style.backgroundImage = 'url(../../include/images/musicFlash/count_3.png)';
            countBox.style.display = 'block';
        } else if ((this.startTime - 2) <= this.currentTime && (this.startTime - 1) >= this.currentTime) {
            // console.log('#################################---> count 2 ##################################');
            countBox.style.backgroundImage = 'url(../../include/images/musicFlash/count_2.png)';
            countBox.style.display = 'block';
        } else if ((this.startTime - 1) <= this.currentTime && (this.startTime) >= this.currentTime) {
            // console.log('#################################---> count 1 ##################################');
            countBox.style.backgroundImage = 'url(../../include/images/musicFlash/count_1.png)';
            countBox.style.display = 'block';
        } else {
            countBox.style.display = 'none';
        }

    }

    setRepeatEnd() {
        const end = this.getPrevNoteId(this.sections[this.currentSection]),
            endNote = this.noteMap.get(end);
        this.sectionEnd = endNote.syncEnd;

        console.log('~~> sectionEnd: ', this.sectionEnd);
    }

    repeatInit() {
        console.log('~~~> repeatInit...');
        this.repeat = {
            songPlay: true,
            mrPlay: false
        };

        this.stateMachine = new StateMachine({
            idle: {
                start: () => {
                    this.player.stop();
                    this.endSync();
                    this.syncPause = true;
                    this.repeat.songPlay = true;

                    this.stateMachine.changeStateTo('mrPlay');
                    this.stateMachine.dispatch('playMr');
                }
            },
            songPlay: {
                playSong: () => {
                    this.player.selectTrack(0);
                    this.syncPause = false;
                    this.player._playback.track.audio.playbackRate = this.currentSpeed;
                    this.player.play();
                    this.player.element.play.className = 'controlsPauseButton';

                    this.initSection();
                    this.repeat.songPlay = true;
                }

            },
            mrPlay: {
                playMr: () => {
                    this.player.selectTrack(3);
                    this.syncPause = false;
                    this.player._playback.track.audio.playbackRate = this.currentSpeed;
                    this.player.play();
                    this.player.element.play.className = 'controlsPauseButton';

                    this.initSection();
                    this.repeat.mrPlay = true;


                }

            },
            end: {
                stop: () => {
                    this.player.element.play.className = 'controlsPlayButton';
                    this.player.stop();
                    this.endSync();
                    this.syncPause = true;

                    this.currentSection = 1;
                    this.clearRepeatFlag();
                    this.player.selectTrack(0);
                }
            }
        });

    }

    clearRepeatFlag() {
        this.repeat.songPlay = false;
        this.repeat.mrPlay = false;
    }

    repeatSessionCheck() {
        console.log('~> repeatSessionCheck: ', this.currentSection);
        console.log('~> repeat: ', this.repeat);

        if (this.currentSection > this.sections.length - 1) {
            this.stateMachine.changeStateTo('end');
            this.stateMachine.dispatch('stop');
        }

        if (this.currentSection === 1) {
            this.stateMachine.dispatch('start');
        } else {

            if (!this.repeat.songPlay && !this.repeat.mrPlay) {
                this.stateMachine.changeStateTo('songPlay');
                this.stateMachine.dispatch('playSong');
            } else if (this.repeat.songPlay && !this.repeat.mrPlay) {
                this.stateMachine.changeStateTo('mrPlay');
                this.stateMachine.dispatch('playMr');
            }
        }

        if (!this.sectionPlay && this.repeat.songPlay && this.repeat.mrPlay) {
            this.currentSection++;
            this.clearRepeatFlag();
        }


    }


}