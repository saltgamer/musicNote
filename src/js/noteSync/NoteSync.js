/***
 * file name : NoteSync.js
 * description : NoteSync class
 * create date : 2018-05-18
 * creator : saltgamer
 ***/

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

        this.currentTime = 0;
        this.currentIndex = 0;
        this.currentNote = this.noteKey + '001';

        this.player = null;

        this.beat = ((this.endTime - this.startTime) / this.noteCount) + this.speedAdjust;

        this.initNote();
        this.initSync();

        console.log('- noteCount: ', this.noteCount);
        console.log('- beat: ', this.beat);

        this.syncPause = false;
        this.noteMap = new Map();
        // this.playedNote = new Map();


        this.onScroll = false;

        this.sections = syncInfo.sections;
        this.currentSection = 1;
        this.sectionEnd = this.endTime;

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
                syncEnd: _end,
                section: this.getCurrentSection(target)
            });
        });

        if (this.mode === 'split') {
            this.showSVG([1, 2]);
        }

    }

    initNote() {
        let index = 0;
        this.svgs.forEach((value, idx) => {
            const svgElement = document.querySelector('#' + value);
            const bar = svgElement.querySelector('#bar_' + (idx + 1));

            for (let i = 0; i < bar.childNodes.length; i++) {
                if (bar.childNodes[i].nodeName !== '#text') {
                    bar.childNodes[i].setAttribute('id', this.getNoteId(index));
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
        this.changeSync();

    }

    showSVG(index) {
        this.svgs.forEach((value, idx) => {
            this.svgElement.querySelector('#' + value).style.display = 'none';
        });

        index.forEach(value => {
            this.svgElement.querySelector('#' + this.svgs[value - 1]).style.display = 'block';
        });

    }

    changeSVG() {
        this.showSVG(this.getSectionGroup());
    }

    getSectionGroup() {
        const note = this.noteMap.get(this.currentNote);
        // console.log('- section: ', section % 2);
        if (note.section % 2 === 1) {
            return [note.section, note.section + 1];
        } else {
            return [note.section-1, note.section];
        }

    }

    getCurrentSection(noteId) {
        let start, end, currentNote, result;
        this.svgs.forEach((value, idx) => {
            start = this.sections[idx];
            end = this.getPrevNoteId(this.sections[idx + 1]);

            start = start.split('_')[1];
            end = end.split('_')[1];
            currentNote = noteId.split('_')[1];

           /* console.log('--------------------------------------------');
            console.log('- noteId: ', noteId);
            console.log('- start: ', start);
            console.log('- end: ', end);
            console.log('--------------------------------------------');*/

            if (parseInt(start) <= parseInt(currentNote) && parseInt(end) >= parseInt(currentNote)) {
                result = idx + 1;
            }
        });

        return result;

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
        }

        if (this.currentTime >= this.sectionEnd) {
            this.player.element.play.className = 'controlsPlayButton';
            this.player.stop();
            this.endSync();
        }

        if (this.mode === 'split') {
            this.changeSVG();
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
        const note = noteId.split('_')[1];
        // console.log('-note: ', note);
        return this.getNoteId(note - 2);

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

        // console.log('- playedNote: ', this.playedNote);

        /*   console.log('- currentIndex: ', this.currentIndex);
           console.log('- currentSyncStart: ', this.currentSyncStart);
           console.log('- currentSyncEnd: ', this.currentSyncEnd);
           console.log('- syncData: ', this.noteSyncData[this.currentIndex]);
           console.log('- duration: ', this.noteSyncData[this.currentIndex] * this.beat);*/

    }

    moveSync() {
        this.noteMap.forEach(value => {
            if (value.syncStart <= this.currentTime && value.syncEnd >= this.currentTime) {

                this.moveNote(value);
            }
        });
    }

    endSync() {
        this.currentIndex = 0;
        this.initSync();
        this.clearNote();
        this.syncPause = true;
    }

    moveNote(value) {
        console.log('==============moveSync==================');
        this.onSymbol(value.target);
        this.currentIndex = value.index;
        this.currentSyncStart = value.syncStart;
        this.currentSyncEnd = value.syncEnd;


       /* if (this.mode === 'split') {
            this.changeSVG(value.section);
        }*/
    }


    render() {
        this.currentTime = this.player._playback.track.audio.currentTime;
        console.log('~* currentTime: ', this.currentTime);

        this.noteChecker();

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



}