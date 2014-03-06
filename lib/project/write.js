var fs = require('fs-extra'),
    HttpError = require('../error').HttpError,
    projectUtils = require('./utils'),
    getFullPath = projectUtils.getFullPath,
    buildPathStructure = projectUtils.buildPathStructure;

/**
 * @param {String} projectId
 * @param {String} path
 * @param {String} data
 * @param {Function} callback
 */
exports.write = function (projectId, path, data, callback) {
    var fullPath = getFullPath(projectId, path),
        structure = buildPathStructure(path);
    if (!structure.w) {
        callback(new HttpError(403, 'Not enough rights to write %s', path));
        return;
    }
    fs.writeFile(fullPath, data, function (err) {
        callback(err, structure);
    });
};