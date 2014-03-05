/**
 * @type {Array.<String>}
 */
var digits10to64 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_".split('');
/**
 * @type {Object.<Number>}
 */
var digits64to10 = {};
/**
 * @type {number}
 */
var base = 64;

digits10to64.reduce(function (map, key, i) {
    map[key] = i;
    return map;
}, digits64to10);

/**
 * @param {Number} number must be integer
 * @returns {string}
 */
exports.encode = function (number) {
    var digit,
        output = '';
    while (number > 0) {
        digit = number % base;
        output = digits10to64[digit] + output;
        number = Math.floor(number / base);
    }
    return output;
};

/**
 * @param {String} string
 * @returns {Number}
 */
exports.decode = function (string) {
    var digits = string.split(''),
        lastIndex = digits.length - 1;
    return digits.reduce(function (prev, cur, i) {
        return prev + digits64to10[cur] * Math.pow(base, lastIndex - i);
    }, 0);
};