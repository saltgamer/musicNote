/***
 * file name : NoteSync.js
 * description : NoteSync class
 * create date : 2018-05-18
 * creator : saltgamer
 ***/

export default class NoteSync {
    constructor(syncInfo) {
        this.svgElement = document.querySelector('#' + syncInfo.svgId);
        this.noteKey = syncInfo.noteKey;
        this.barGroupKey = syncInfo.barGroupKey;
        this.fillColor = syncInfo.fillColor;
        this.startTime = syncInfo.start;
        this.endTime = syncInfo.end;
        this.noteCount = syncInfo.noteSyncData.length;
        this.noteSyncData = syncInfo.noteSyncData;
        this.speedAdjust = syncInfo.speedAdjust;

        this.currentTime = 0;
        this.currentIndex = 0;

        this.player = null;

        this.beat = ((this.endTime - this.startTime) / this.noteCount) + this.speedAdjust;

        this.initSync();

        console.log('- noteCount: ', this.noteCount);
        console.log('- beat: ', this.beat);

        this.syncPause = false;

        this.noteMap = new Map();
        // this.playedNote = new Map();

        this.initNoteMap();
        console.log('-- noteMap: ', this.noteMap);


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

            this.noteMap.set(target, {
                element: this.svgElement.querySelector('#' + target),
                target: target,
                index: idx,
                duration: value,
                syncStart: _start,
                syncEnd: _end
            });
        });
    }

    updateSync() {
        this.currentIndex++;
        this.currentSyncStart = this.currentSyncEnd;
        this.currentSyncEnd += this.noteSyncData[this.currentIndex] * this.beat;

        console.log('-----------------------updateSync----------------------');
        console.log('- currentSyncStart: ', this.currentSyncStart);
        console.log('- currentSyncEnd: ', this.currentSyncEnd);
        console.log('- syncData: ', this.noteSyncData[this.currentIndex]);
        console.log('- duration: ', this.noteSyncData[this.currentIndex] * this.beat);

    }

    startSync(player) {
        this.player = player;

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
        }

    }

    onSymbol(target) {
        this.svgElement.querySelector('#' + target).style.fill = this.fillColor;

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

    changeSync() {
        this.clearNote();

        if (!this.player) {
            return;
        }
        this.currentTime = this.player._playback.track.audio.currentTime;
        console.log('-----------------------changeSync----------------------');
        console.log('- currentTime: ', this.currentTime);
        this.currentIndex = 0;
        this.initSync();

        this.moveSync();

        console.log('- playedNote: ', this.playedNote);

     /*   console.log('- currentIndex: ', this.currentIndex);
        console.log('- currentSyncStart: ', this.currentSyncStart);
        console.log('- currentSyncEnd: ', this.currentSyncEnd);
        console.log('- syncData: ', this.noteSyncData[this.currentIndex]);
        console.log('- duration: ', this.noteSyncData[this.currentIndex] * this.beat);*/

    }

    moveSync() {
        this.noteMap.forEach(value => {
            if (value.syncStart <= this.currentTime && value.syncEnd >= this.currentTime) {
                console.log('==============moveSync==================');
                this.onSymbol(value.target);
                this.currentIndex = value.index;
                this.currentSyncStart = value.syncStart;
                this.currentSyncEnd = value.syncEnd;
            }
        });
    }

    render() {
        this.currentTime = this.player._playback.track.audio.currentTime;
        console.log('~* currentTime: ', this.currentTime);

        this.noteChecker();

        if (!this.syncPause) {
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




}