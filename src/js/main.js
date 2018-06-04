/***
 * file name : main.js
 * description : musicNote entry file
 * create date : 2018-05-17
 * creator : saltgamer
 ***/

import '../css/musicNote.css';
import AudioPlayer from './audioPlayer/AudioPlayer';
import {initControls} from "./audioPlayer/controls";
import NoteSync from "./noteSync/NoteSync";

window.musicNote = function (params) {

    const player = new AudioPlayer(params.tracks, {});
    const noteSync = new NoteSync(params.syncInfo);


    initControls(params.target, player, noteSync);

};







