/***
 * file name : controls.js
 * description : AudioPlayer controls
 * create date : 2018-05-17
 * creator : saltgamer
 ***/

import DOMBuilder from '../utils/DOMBuilder';
import RangeSlider from '../utils/RangeSlider';

export function initControls (target, player, noteSync) {
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
        } else {
            controlsPlayButton.className = 'controlsPlayButton';
            player.pause();
            noteSync.syncPause = true;
        }
    });

    const controlsStopButton = DOMBuilder.createElement('div', {
        attrs: {
            class: 'controlsStopButton',
        },
        parent: controls,
    });
    controlsStopButton.addEventListener('click', () => {
        player.stop();
        noteSync.currentIndex = 0;
        noteSync.initSync();
        noteSync.clearNote();
        controlsPlayButton.className = 'controlsPlayButton';
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
        noteSync.currentIndex = 0;
        noteSync.initSync();
    });

    document.addEventListener('scroll', () => {
        console.log('-> scroll!');
        noteSync.onScroll = true;

    });



}