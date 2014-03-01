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
 * @param {Function} callback
 */
exports.status = make.status;
/**
 * @param {String} projectId
 * @param {Object} decl
 * @param {Function} callback
 */
exports.createBemEntity = require('./createBemEntity').createBemEntity;