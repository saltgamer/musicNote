/***
 * file name : controls.js
 * description : AudioPlayer controls
 * create date : 2018-05-17
 * creator : saltgamer
 ***/

import DOMBuilder from '../utils/DOMBuilder';
import RangeSlider from '../utils/RangeSlider';

export function initControls(target, player, noteSync) {
    console.log('-> initControls...');

    const bar = DOMBuilder.createElement('div', {
        attrs: {
            class: 'bar',
        },
        parent: target,
    });

    const progress = DOMBuilder.createElement('div', {
        attrs: {
            class: 'progress',
        },
        parent: bar,
    });

    const progressBar = DOMBuilder.createElement('div', {
        attrs: {
            class: 'progress_bar',
        },
        parent: progress,
    });

    const controls = DOMBuilder.createElement('div', {
        attrs: {
            class: 'controls',
        },
        parent: bar,
    });

    const controlsPlayButton = DOMBuilder.createElement('div', {
        attrs: {
            class: 'controlsPlayButton',
        },
        parent: controls,
    });
    controlsPlayButton.addEventListener('click', () => {
        if (!player.isPlaying) {
            controlsPlayButton.className = 'controlsPauseyButton';

            player.play();
            noteSync.syncPause = false;
            noteSync.startSync(player);

            // setTimeout(() => {
                player._playback.track.audio.playbackRate = noteSync.currentSpeed;
            // }, 500);

        } else {
            controlsPlayButton.className = 'controlsPlayButton';
            player.pause();
            noteSync.syncPause = true;
        }
    });
    player.element.play = controlsPlayButton;

    const controlsStopButton = DOMBuilder.createElement('div', {
        attrs: {
            class: 'controlsStopButton',
        },
        parent: controls,
    });
    controlsStopButton.addEventListener('click', () => {
        player.stop();
        noteSync.endSync();
        controlsPlayButton.className = 'controlsPlayButton';
    });
    player.element.stop = controlsStopButton;

    const controlsPrevButton = DOMBuilder.createElement('div', {
        attrs: {
            class: 'controlsPrevButton',
        },
        parent: controls,
    });
    controlsPrevButton.addEventListener('click', (e) => {
        e.preventDefault();

        if (noteSync.currentSection > 1) {
            noteSync.currentSection--;
        }

        sectionInfo.innerText = noteSync.currentSection + ' / ' + (noteSync.sections.length - 1);
        // console.log('-currentSection: ', noteSync.currentSection);

    });

    const sectionInfo = DOMBuilder.createElement('div', {
        attrs: {
            class: 'sectionInfo',
        },
        parent: controls,
    });
    sectionInfo.innerText = noteSync.currentSection + ' / ' + (noteSync.sections.length - 1);


    const controlsNextButton = DOMBuilder.createElement('div', {
        attrs: {
            class: 'controlsNextButton',
        },
        parent: controls,
    });
    controlsNextButton.addEventListener('click', (e) => {
        e.preventDefault();

        if (noteSync.currentSection < noteSync.sections.length - 1) {
            noteSync.currentSection++;
        }
        sectionInfo.innerText = noteSync.currentSection + ' / ' + (noteSync.sections.length - 1);
        // console.log('-currentSection: ', noteSync.currentSection);

    });


    const sectionPlayButton = DOMBuilder.createElement('div', {
        attrs: {
            class: 'sectionPlayButton',
        },
        parent: controls,
    });
    sectionPlayButton.addEventListener('click', (e) => {
        e.preventDefault();
        controlsPlayButton.className = 'controlsPauseyButton';
        player.play();
        noteSync.syncPause = false;
        noteSync.startSync(player);

        noteSync.initSection();

        // setTimeout(() => {
            player._playback.track.audio.playbackRate = noteSync.currentSpeed;
        // }, 500);

    });

    const halfPlayButton = DOMBuilder.createElement('div', {
        attrs: {
            class: 'halfPlayButton',
        },
        parent: controls,
    });
    halfPlayButton.setAttribute('selected', false);
    halfPlayButton.addEventListener('click', (e) => {
        e.preventDefault();

        controlsPlayButton.className = 'controlsPlayButton';
        noteSync.endSync();

        changeSelect({
            element: e.target,
            trueCallBack: () => {
                if (noteSync.currentPick === 'song') {
                    player.selectTrack(2);
                } else {
                    player.selectTrack(5);
                }
                e.target.style.backgroundImage = 'url(./images/play_over.svg)';
                onePlayButton.style.backgroundImage = 'url(./images/next.svg)';
                onePlayButton.setAttribute('selected', false);
            },
            falseCallBack: () => {
                if (noteSync.currentPick === 'song') {
                    player.selectTrack(0);
                } else {
                    player.selectTrack(3);
                }
                e.target.style.backgroundImage = 'url(./images/play.svg)';
                onePlayButton.style.backgroundImage = 'url(./images/next.svg)';
                onePlayButton.setAttribute('selected', false);
            }
        });

    });


    const onePlayButton = DOMBuilder.createElement('div', {
        attrs: {
            class: 'onePlayButton',
        },
        parent: controls,
    });
    onePlayButton.setAttribute('selected', false);
    onePlayButton.addEventListener('click', (e) => {
        e.preventDefault();

        controlsPlayButton.className = 'controlsPlayButton';
        noteSync.endSync();

        changeSelect({
            element: e.target,
            trueCallBack: () => {
                if (noteSync.currentPick === 'song') {
                    player.selectTrack(1);
                } else {
                    player.selectTrack(4);
                }
                e.target.style.backgroundImage = 'url(./images/next_over.svg)';
                halfPlayButton.style.backgroundImage = 'url(./images/play.svg)';
                halfPlayButton.setAttribute('selected', false);
            },
            falseCallBack: () => {
                if (noteSync.currentPick === 'song') {
                    player.selectTrack(0);
                } else {
                    player.selectTrack(3);
                }
                e.target.style.backgroundImage = 'url(./images/next.svg)';
                halfPlayButton.style.backgroundImage = 'url(./images/play.svg)';
                halfPlayButton.setAttribute('selected', false);
            }
        });
        // console.log('----------------- playbackRate: ', player._playback.track.audio.playbackRate);

    });

    const progressSlider = new RangeSlider(progressBar, {
        handle: true,
        buffer: true,
        onchange: (value) => {
            player.rewind(value);
            noteSync.changeSync();
        }
    });

    const updateBuffer = (event) => {
        const audio = event.target;
        const buffered = audio.buffered;
        const buffRatio = buffered.length ? buffered.end(buffered.length - 1) / audio.duration : 0;

        progressSlider.setBuffer(buffRatio);
    };

    player.on('track:progress', updateBuffer);
    player.on('track:loadeddata', updateBuffer);
    player.on('track:canplaythrough', updateBuffer);
    player.on('track:timeupdate', (event) => {
        const audio = event.target;
        const ratio = audio.currentTime / audio.duration;
        progressSlider.setValue(ratio);

    });

    player.on('track:ended', (event) => {
        controlsPlayButton.className = 'controlsPlayButton';
        noteSync.endSync();
    });


    document.addEventListener('scroll', () => {
        console.log('-> scroll!');
        noteSync.onScroll = true;

    });

    const pickContainer = DOMBuilder.createElement('div', {
        attrs: {
            class: 'pickContainer',
        },
        parent: document.body,
    });

    function changePick(element) {
        element.style.backgroundColor = '#ff9900';

        if (element.className === 'pickSongButton') {
            pickMrButton.style.backgroundColor = '#333';
        } else {
            pickSongButton.style.backgroundColor = '#333';
        }

    }

    const pickSongButton = DOMBuilder.createElement('div', {
        attrs: {
            class: 'pickSongButton',
        },
        text: '노래',
        parent: pickContainer,
    });
    pickSongButton.addEventListener('click', (e) => {
        e.preventDefault();
        changePick(e.target);
        controlsPlayButton.className = 'controlsPlayButton';
        noteSync.endSync();
        player.selectTrack(0);
        noteSync.currentPick = 'song';
    });

    const pickMrButton = DOMBuilder.createElement('div', {
        attrs: {
            class: 'pickMrButton',
        },
        text: '반주',
        parent: pickContainer,
    });
    pickMrButton.addEventListener('click', (e) => {
        e.preventDefault();
        changePick(e.target);
        controlsPlayButton.className = 'controlsPlayButton';
        noteSync.endSync();
        player.selectTrack(3);
        noteSync.currentPick = 'mr';
    });

    if (noteSync.currentPick === 'song') {
        pickSongButton.click();
    } else {
        pickMrButton.click();
    }

    const lyricsButton = DOMBuilder.createElement('div', {
        attrs: {
            class: 'lyricsButton',
        },
        text: '가사',
        parent: controls,
    });
    lyricsButton.setAttribute('selected', true);
    lyricsButton.addEventListener('click', (e) => {
        e.preventDefault();
        changeSelect({
            element: e.target,
            trueCallBack: () => {
                noteSync.showLyrics();
                noteSync.hideSyllable();
                e.target.style.backgroundColor = '#ff9900';
                syllableButton.style.backgroundColor = '#eee';
                syllableButton.setAttribute('selected', false);
            },
            falseCallBack: () => {
                noteSync.hideLyrics();
                noteSync.hideSyllable();
                e.target.style.backgroundColor = '#eee';
                syllableButton.style.backgroundColor = '#eee';
                syllableButton.setAttribute('selected', false);
            }
        });
    });

    const syllableButton = DOMBuilder.createElement('div', {
        attrs: {
            class: 'syllableButton',
        },
        text: '계이름',
        parent: controls,
    });
    syllableButton.setAttribute('selected', false);
    syllableButton.addEventListener('click', (e) => {
        e.preventDefault();
        changeSelect({
            element: e.target,
            trueCallBack: () => {
                noteSync.showSyllable();
                noteSync.hideLyrics();
                e.target.style.backgroundColor = '#ff9900';
                lyricsButton.style.backgroundColor = '#eee';
                lyricsButton.setAttribute('selected', false);
            },
            falseCallBack: () => {
                noteSync.hideSyllable();
                noteSync.hideLyrics();
                e.target.style.backgroundColor = '#eee';
                lyricsButton.style.backgroundColor = '#eee';
                lyricsButton.setAttribute('selected', false);
            }
        });

    });


    const minusButton = DOMBuilder.createElement('div', {
        attrs: {
            class: 'minusButton',
        },
        parent: controls,
    });
    minusButton.setAttribute('selected', false);
    minusButton.addEventListener('click', (e) => {
        e.preventDefault();

        player.stop();
        controlsPlayButton.className = 'controlsPlayButton';
        noteSync.endSync();

        changeSelect({
            element: e.target,
            trueCallBack: () => {
                // player.setSpeed(1 - 0.15);
                noteSync.currentSpeed = 1.0 - 0.15;
                e.target.style.backgroundImage = 'url(./images/minus_over.svg)';
                plusButton.style.backgroundImage = 'url(./images/plus.svg)';
                plusButton.setAttribute('selected', false);
            },
            falseCallBack: () => {
                // player.setSpeed(1.0);
                noteSync.currentSpeed = 1.0;
                e.target.style.backgroundImage = 'url(./images/minus.svg)';
                plusButton.style.backgroundImage = 'url(./images/plus.svg)';
                plusButton.setAttribute('selected', false);
            }
        });
        // console.log('----------------- playbackRate: ', player._playback.track.audio.playbackRate);

    });


    const plusButton = DOMBuilder.createElement('div', {
        attrs: {
            class: 'plusButton',
        },
        parent: controls,
    });
    plusButton.setAttribute('selected', false);
    plusButton.addEventListener('click', (e) => {
        e.preventDefault();

        player.stop();
        controlsPlayButton.className = 'controlsPlayButton';
        noteSync.endSync();

        changeSelect({
            element: e.target,
            trueCallBack: () => {

                // setTimeout(() => {
                //     player.setSpeed(1.15);
                noteSync.currentSpeed = 1.15;
                // }, 1000);
                e.target.style.backgroundImage = 'url(./images/plus_over.svg)';
                minusButton.style.backgroundImage = 'url(./images/minus.svg)';
                minusButton.setAttribute('selected', false);
            },
            falseCallBack: () => {
                // player.setSpeed(1.0);
                noteSync.currentSpeed = 1.0;
                e.target.style.backgroundImage = 'url(./images/plus.svg)';
                minusButton.style.backgroundImage = 'url(./images/minus.svg)';
                minusButton.setAttribute('selected', false);
            }
        });
        // console.log('----------------- playbackRate: ', player._playback.track.audio.playbackRate);

    });


}

function changeSelect(params) {

    if (params.element.getAttribute('selected') === 'true') {
        params.element.setAttribute('selected', false);
        params.falseCallBack();

    } else {
        params.element.setAttribute('selected', true);
        params.trueCallBack();
    }
}


