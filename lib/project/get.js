var fs = require('fs-extra'),
    projectUtils = require('./utils'),
    getFullPath = projectUtils.getFullPath,
    buildPathsStructure = projectUtils.buildPathsStructure,
    buildPathStructure = projectUtils.buildPathStructure,
    exampleDirStructure = projectUtils.exampleDirStructure;

/**
 * @param {String} projectId
 * @param {String} pathToRead
 * @param {Function} callback
 */
exports.get = function (projectId, pathToRead, callback) {
    if (!pathToRead) {
        callback(null, exampleDirStructure);
        return;
    }
    var fullPath = getFullPath(projectId, pathToRead),
        structure = buildPathStructure(pathToRead);
    fs.stat(fullPath, function (err, stat) {
        if (err) {
            callback(err);
            return;
        }
        if (stat.isDirectory()) {
            getDirectory(fullPath, pathToRead, structure, callback);
        } else if (stat.isFile()) {
            getFile(fullPath, structure, callback);
        } else {
            callback(new Error(404));
        }
    });
};

/**
 * @param {String} fullPath to the directory
 * @param {String} relativePath to the directory
 * @param {{r: boolean}} structure with readability flag
 * @param {Function} callback
 */
function getDirectory (fullPath, relativePath, structure, callback) {
    if (!structure.r) {
        callback(new Error(403));
        return;
    }
    fs.readdir(fullPath, function (err, paths) {
        if (err) {
            callback(err);
            return;
        }
        structure.content = buildPathsStructure(paths, relativePath);
        callback(null, structure);
    });
}

/**
 * @param {String} fullPath to the file
 * @param {{r: boolean}} structure with readability flag
 * @param {Function} callback
 */
function getFile (fullPath, structure, callback) {
    if (!structure.r) {
        callback(new Error(403));
        return;
    }
    fs.readFile(fullPath, 'utf8', function (err, content) {
        structure.content = content;
        callback(err, structure);
    });
}