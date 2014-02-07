var digits = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_".split('');

/**
 * @param {Number} number must be integer
 * @returns {string}
 */
module.exports = function (number) {
    var digit,
        output = '';
    while (number > 0) {
        digit = number % 64;
        output = digits[digit] + output;
        number = Math.floor(number / 64);
    }
    return output;
};