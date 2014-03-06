var util = require('util'),
    slice = Array.prototype.slice;

/**
 * @class HttpError
 * @extends Error
 * @param {Number} status
 * @param {...String} message
 */
var HttpError = function (status, message) {
    if (arguments.length > 2) {
        message = util.format.apply(util, slice.call(arguments, 1));
    }
    var tmp = Error.call(this, message);

    this.name = 'HttpError';
    this.stack = tmp.stack;
    this.message = message;
    this.status = status;
};

util.inherits(HttpError, Error);

exports.HttpError = HttpError;

/**
 * @param {HttpError} err
 * @param {Response} res
 */
var handleError = function (err, res) {
    if (!err.status || err.status === 500) {
        err.status = 500;
        console.log(err);
    }
    res.send(err.status, err.message);
};

/**
 * @param {Response} res
 * @param {Function} callback
 * @returns {Function}
 */
exports.handleErrors = function (res, callback) {
    return function (err) {
        if (err) {
            handleError(err, res);
            return;
        }
        callback.apply(null, slice.call(arguments, 1))
    }
};
