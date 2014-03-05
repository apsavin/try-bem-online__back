var path = require('path'),
    fs = require('fs-extra'),
    generateProjectId = require('./id').generate,
    projectUtils = require('./utils'),
    appPaths = projectUtils.appPaths,
    examplePathsConfig = projectUtils.examplePathsConfig,
    examplePaths = generateFullPaths(appPaths.examplePath);

/**
 * @param {Function} callback
 */
exports.create = function (callback) {
    var id = generateProjectId(),
        newProjectPath = path.join(appPaths.tmpPath, id),
        newProjectPaths = generateFullPaths(newProjectPath),
        isCallbackWasUsed = false,
        notCopiedCount = examplePaths.copied.length,
        notSymlinkedCount = examplePaths.symlinked.length,
        success = function () {
            if (!notCopiedCount && !notSymlinkedCount && !isCallbackWasUsed) {
                callback(null, id);
                isCallbackWasUsed = true;
            }
        },
        onCopy = function (err) {
            if (err && !isCallbackWasUsed) {
                callback(err);
                isCallbackWasUsed = true;
            }
            notCopiedCount--;
            success();
        },
        onSymlink = function (err) {
            if (err && !isCallbackWasUsed) {
                callback(err);
                isCallbackWasUsed = true;
            }
            notSymlinkedCount--;
            success();
        };
    fs.mkdir(newProjectPath, function (err) {
        if (err) {
            callback(err);
            return;
        }
        examplePaths.copied.map(function (pathToCopyFrom, i) {
            fs.copy(pathToCopyFrom, newProjectPaths.copied[i], onCopy);
        });
        examplePaths.symlinked.map(function (pathToCopyFrom, i) {
            fs.symlink(pathToCopyFrom, newProjectPaths.symlinked[i], onSymlink);
        });
    });
};

/**
 * @param pathToProject
 * @returns {{copied: Array.<String>, excluded: Array.<String>, symlinked: Array.<String>}} paths
 */
function generateFullPaths (pathToProject) {
    var normalizePath = function (dir) {
            return path.join(pathToProject, dir);
        },
        paths = {};

    ['copied', 'symlinked'].forEach(function (pathsNameSpace) {
        paths[pathsNameSpace] = this[pathsNameSpace].map(normalizePath);
    }, examplePathsConfig);

    return paths;
}
