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
