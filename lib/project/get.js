var fs = require('fs-extra'),
    projectUtils = require('./utils'),
    path = require('path'),
    HttpError = require('../error').HttpError,
    getFullPath = projectUtils.getFullPath,
    buildPathsStructure = projectUtils.buildPathsStructure,
    buildPathStructure = projectUtils.buildPathStructure,
    exampleDirStructure = projectUtils.exampleDirStructure;

/**
 * @param {String} projectId
 * @param {String} pathToRead = ''
 * @param {Function} callback
 */
exports.get = function (projectId, pathToRead, callback) {
    pathToRead = pathToRead || '';
    var fullPath = getFullPath(projectId, pathToRead);
    fs.stat(fullPath, function (err, stat) {
        if (err) {
            throw404(callback, projectId, pathToRead);
            return;
        }
        if (!pathToRead) {
            callback(null, exampleDirStructure);
            return;
        }
        var structure = buildPathStructure(pathToRead);
        if (stat.isDirectory()) {
            getDirectory(fullPath, pathToRead, structure, callback);
        } else if (stat.isFile()) {
            getFile(fullPath, pathToRead, structure, callback);
        } else {
            throw404(callback, projectId, pathToRead);
        }
    });
};

function throw404 (callback, projectId, pathToRead) {
    callback(new HttpError(404, 'Not found %s', path.join(projectId, pathToRead)));
}

/**
 * @param {String} fullPath to the directory
 * @param {String} relativePath to the directory
 * @param {{r: boolean}} structure with readability flag
 * @param {Function} callback
 */
function getDirectory (fullPath, relativePath, structure, callback) {
    if (!structure.r) {
        process.nextTick(function () {
            callback(new HttpError(403, 'Not enough rights to read %s', relativePath));
        });
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
 * @param {String} relativePath to the directory
 * @param {{r: boolean}} structure with readability flag
 * @param {Function} callback
 */
function getFile (fullPath, relativePath, structure, callback) {
    if (!structure.r) {
        process.nextTick(function () {
            callback(new HttpError(403, 'Not enough rights to read %s', relativePath));
        });
        return;
    }
    fs.readFile(fullPath, 'utf8', function (err, content) {
        structure.content = content;
        callback(err, structure);
    });
}