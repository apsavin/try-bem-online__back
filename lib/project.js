var fs = require('fs-extra'),
    path = require('path'),
    difference = require('lodash.difference'),
    config = require('./configurator').process(require('../config/config'));

init();

var examplePaths = generateFullPaths(config.examplePath);

/**
 * @param {Function} callback
 */
exports.create = function (callback) {
    var id = getProjectId(),
        newProjectPath = path.join(config.tmpPath, id),
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
 * @param {String} projectId
 * @param {String|undefined} path = ''
 * @param {Function} callback
 */
exports.get = function (projectId, path, callback) {
    path = path || '';
    callback(null, projectId);
};

function init () {
    if (!fs.existsSync(config.examplePath)) {
        throw new Error('path ' + config.examplePath + ' is not exist');
    }
    if (!fs.existsSync(config.tmpPath)) {
        fs.mkdirSync(config.tmpPath);
    }

    var exampleProjectDirStructure = fs.readdirSync(config.examplePath);

    config.examplePaths.copied = difference(exampleProjectDirStructure, config.examplePaths.excluded, config.examplePaths.symlinked);
}

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
    }, config.examplePaths);

    return paths;
}

/**
 * @returns {String}
 */
function getProjectId () {
    return Date.now().toString() + Math.random().toString();
}