/**
 * @param {Function} callback
 */
exports.create = require('./create').create;

/**
 * @param {String} projectId
 * @param {String} pathToRead
 * @param {Function} callback
 */
exports.get = require('./get').get;

/**
 * @param {String} projectId
 * @param {String} path
 * @param {String} data
 * @param {Function} callback
 */
exports.write = require('./write').write;

var make = require('./make');

/**
 * @param {String} projectId
 * @param {Function} callback
 */
exports.build = make.build;

/**
 * @param {String} projectId
 * @param {Function} callback
 */
exports.clean = make.clean;

/**
 * @param {String} projectId
 * @param {String} method
 * @param {Number} queue
 * @param {Function} callback
 */
exports.status = make.status;
/**
 * @param {String} projectId
 * @param {Object} decl
 * @param {Function} callback
 */
exports.createBemEntity = require('./createBemEntity').createBemEntity;

var remove = require('./remove');

/**
 * @param {String} projectId
 * @param {Function} callback
 */
exports.remove = remove.remove;

/**
 * @param {Date} since
 * @param {Function} callback
 */
exports.removeOld = remove.removeOld;