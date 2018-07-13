/***
 * file name : controls.js
 * description : AudioPlayer controls
 * create date : 2018-05-17
 * creator : saltgamer
 ***/

import DOMBuilder from '../utils/DOMBuilder';
import RangeSlider from '../utils/RangeSlider';
import {$qsa, getURLParameter} from '../utils';

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

    const allLabel = DOMBuilder.createElement('img', {
        attrs: {
            class: 'allLabel',
            src: './images/allLabel.png'
        },
        parent: controls,
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
        clearSectionIcon();

    });
    player.element.stop = controlsStopButton;

    const splitLine = DOMBuilder.createElement('div', {
        attrs: {
            class: 'splitLine',
        },
        parent: controls,
    });

    const partLabel = DOMBuilder.createElement('img', {
        attrs: {
            class: 'allLabel',
            src: './images/partLabel.png'
        },
        parent: controls,
    });
    partLabel.style.left = '145px';

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


    initSections(controls, controlsPlayButton, noteSync, player);

    const splitLine2 = DOMBuilder.createElement('div', {
        attrs: {
            class: 'splitLine',
        },
        parent: controls,
    });
    splitLine2.style.left = '156px';

    const loopPlayButton = DOMBuilder.createElement('div', {
        attrs: {
            class: 'loopPlayButton',
        },
        parent: controls,
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
                e.target.style.backgroundImage = 'url(./images/btn_half_over.png)';
                onePlayButton.style.backgroundImage = 'url(./images/btn_one.png)';
                onePlayButton.setAttribute('selected', false);
            },
            falseCallBack: () => {
                if (noteSync.currentPick === 'song') {
                    player.selectTrack(0);
                } else {
                    player.selectTrack(3);
                }
                e.target.style.backgroundImage = 'url(./images/btn_half.png)';
                onePlayButton.style.backgroundImage = 'url(./images/btn_one.png)';
                onePlayButton.setAttribute('selected', false);
            }
        });

    });

    // console.log('--> playlist: ', player.playlist);
    const tracks = player.playlist._tracks;
    if (noteSync.currentPick === 'song') {
        if (tracks[2]._src === '') {
            halfPlayButton.style.pointerEvents = 'none';
            halfPlayButton.style.opacity = 0.5;
        }
    } else {
        if (tracks[5]._src === '') {
            halfPlayButton.style.pointerEvents = 'none';
            halfPlayButton.style.opacity = 0.5;
        }
    }

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
                e.target.style.backgroundImage = 'url(./images/btn_one_over.png)';
                halfPlayButton.style.backgroundImage = 'url(./images/btn_half.png)';
                halfPlayButton.setAttribute('selected', false);
            },
            falseCallBack: () => {
                if (noteSync.currentPick === 'song') {
                    player.selectTrack(0);
                } else {
                    player.selectTrack(3);
                }
                e.target.style.backgroundImage = 'url(./images/btn_one.png)';
                halfPlayButton.style.backgroundImage = 'url(./images/btn_half.png)';
                halfPlayButton.setAttribute('selected', false);
            }
        });
        // console.log('----------------- playbackRate: ', player._playback.track.audio.playbackRate);

    });

    if (noteSync.currentPick === 'song') {
        if (tracks[1]._src === '') {
            onePlayButton.style.pointerEvents = 'none';
            onePlayButton.style.opacity = 0.5;
        }
    } else {
        if (tracks[4]._src === '') {
            onePlayButton.style.pointerEvents = 'none';
            onePlayButton.style.opacity = 0.5;
        }
    }

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

    const countBox = DOMBuilder.createElement('div', {
        attrs: {
            class: 'countBox',
        },
        parent: target.parentNode.parentNode,
    });

    initMode(pickSongButton, syllableButton, pickMrButton);


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

function initSections(target, playerButton, noteSync, player) {

    if (noteSync.sections.length > 10) {
        alert('[!] 현재 버전은 최대 10개 구간만 지원합니다!');
        return;
    }

    const sectionIconBox = DOMBuilder.createElement('div', {
        attrs: {
            class: 'sectionIconBox',
        },
        parent: target
    });

    const sectionWidth = ((noteSync.sections.length - 1) * 33);
    sectionIconBox.style.width = sectionWidth + 'px';
    target.parentNode.parentNode.style.width = (520 + sectionWidth) + 'px';

    for (let i = 0; i < noteSync.sections.length - 1; i++) {
        const sectionIcon = DOMBuilder.createElement('img', {
            attrs: {
                class: 'sectionIcon',
                section: i + 1,
                src: './images/sectionIcon_' + (i + 1) + '.png'
            },
            parent: sectionIconBox
        });

        sectionIcon.addEventListener('click', (e) => {
            e.preventDefault();
            clearSectionIcon();
            e.target.src = e.target.src.replace('.png', '_over.png');

            noteSync.currentSection = e.target.getAttribute('section');

            playerButton.className = 'controlsPauseyButton';
            player.play();
            noteSync.syncPause = false;
            noteSync.startSync(player);

            noteSync.initSection();

            player._playback.track.audio.playbackRate = noteSync.currentSpeed;

        });
    }


}

function clearSectionIcon() {
    const sectionIcons = $qsa('.sectionIcon');
    sectionIcons.forEach((icon) => {
       icon.src = icon.src.replace('_over', '');
    });
}


function initMode(pickSongButton, syllableButton, pickMrButton) {
    const mode = getURLParameter('mode');

    switch (mode) {
        case 'sing':
            pickSongButton.click();
            break;
        case 'syllable':
            syllableButton.click();
            break;
        case 'mr':
            pickMrButton.click();
            break;
    }

}


