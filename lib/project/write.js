var fs = require('fs-extra'),
    esprima = require('esprima'),
    path = require('path'),
    HttpError = require('../error').HttpError,
    projectUtils = require('./utils'),
    getFullPath = projectUtils.getFullPath,
    buildPathStructure = projectUtils.buildPathStructure;

/**
 * @param {String} projectId
 * @param {String} pathToFile
 * @param {String} data
 * @param {Function} callback
 */
exports.write = function (projectId, pathToFile, data, callback) {
    var fullPath = getFullPath(projectId, pathToFile),
        structure = buildPathStructure(pathToFile);
    if (!structure.w) {
        callback(new HttpError(403, 'Not enough rights to write %s', pathToFile));
        return;
    }
    if (path.extname(pathToFile) === '.js') {
        try {
            esprima.parse(data);
        } catch (e) {
            callback(new HttpError(400, e.toString()));
            return;
        }
    }
    fs.writeFile(fullPath, data, function (err) {
        callback(err, structure);
    });
};