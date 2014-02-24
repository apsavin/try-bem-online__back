var fs = require('fs-extra'),
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
        callback(new Error(403));
        return;
    }
    fs.writeFile(fullPath, data, function (err) {
        callback(err, structure);
    });
};