var base64 = require('../base64'),
    datePartLength = base64.encode(Date.now()).length;

/**
 * @param {string} projectId
 * @returns {boolean}
 */
exports.isValid = function (projectId) {
    return /^[\w-]+$/.test(projectId);
};

/**
 * @returns {string}
 */
exports.generate = function () {
    return [Date.now(), Math.random() * Math.pow(10, 18)]
        .map(base64.encode)
        .join('');
};

/**
 * @param {string} projectId
 * @returns {Date}
 */
exports.getDateOfCreation = function (projectId) {
    return new Date(base64.decode(projectId.substr(0, datePartLength)));
};