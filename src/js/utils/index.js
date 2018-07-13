/***
 * file name : utils/index.js
 * description : utility index file
 * create date : 2018-06-15
 * creator : saltgamer
 ***/
export function $qs(selector) {
    return document.querySelector(selector);
}

export function $qsa(selector) {
    return document.querySelectorAll(selector);
}
export function isFunction(functionToCheck) {
    const getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

export function validateInRange(value, min, max) {
    let validValue;
    if (max && value > max) {
        validValue = max;
    } else if (min && value < min) {
        validValue = min;
    } else {
        validValue = value;
    }
    return validValue;
}

/**
 * @param {Number} r Radius of circle
 * @param {Number} fi Angle in the range [0, 2π)
 */
export function calcPolarCoords(r, fi) {
    return {
        x: r * Math.cos(fi),
        y: r * Math.sin(fi),
    };
}

export function getURLParameter(sParam) {
    const sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&');

    for (let i = 0; i < sURLVariables.length; i++) {
        const sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam) {
            return sParameterName[1];
        }
    }
}
