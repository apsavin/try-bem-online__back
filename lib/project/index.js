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

/**
 * @param {String} projectId
 * @param {Function} callback
 */
exports.build = require('./make').build;

/**
 * @param {String} projectId
 * @param {Function} callback
 */
exports.clean = require('./make').clean;

/**
 * @param {String} projectId
 * @param {Object} decl
 * @param {Function} callback
 */
exports.createBemEntity = require('./createBemEntity').createBemEntity;