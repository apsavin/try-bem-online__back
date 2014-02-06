var fs = require('fs-extra'),
    path = require('path'),
    difference = require('lodash.difference'),
    config = require('./configurator').process(require('../config/config'));

init();

var examplePaths = generateFullPaths(config.examplePath),
    exampleDirStructure;

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
 * @param {String} pathToRead
 * @param {Function} callback
 */
exports.get = function (projectId, pathToRead, callback) {
    if (!pathToRead) {
        callback(null, exampleDirStructure);
        return;
    }
    var fullPath = path.join(config.tmpPath, projectId, pathToRead),
        structure = buildPathStructure(pathToRead);
    fs.stat(fullPath, function (err, stat) {
        if (err) {
            callback(err);
            return;
        }
        if (stat.isDirectory()) {
            getDirectory(fullPath, structure, callback);
        } else if (stat.isFile()) {
            getFile(fullPath, structure, callback);
        } else {
            callback(new Error('404'));
        }
    });
};

function init () {
    if (!fs.existsSync(config.examplePath)) {
        throw new Error('path ' + config.examplePath + ' is not exist');
    }
    if (!fs.existsSync(config.tmpPath)) {
        fs.mkdirSync(config.tmpPath);
    }

    var exampleProjectPaths = fs.readdirSync(config.examplePath);

    config.examplePaths.copied = difference(exampleProjectPaths, config.examplePaths.excluded, config.examplePaths.symlinked);

    exampleDirStructure = {
        r: true,
        w: false,
        content: buildPathsStructure(config.examplePaths.copied.concat(config.examplePaths.symlinked).sort())
    };
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

/**
 * @param {Array.<String>} dirStructure
 * @returns {Array.<{r: boolean, w: boolean, content: String}>}
 */
function buildPathsStructure (dirStructure) {
    return dirStructure.map(buildPathStructure);
}

/**
 * @param {String} pathToParse
 * @returns {{r: boolean, w: boolean, content: String}}
 */
function buildPathStructure (pathToParse) {
    var structure = {content: pathToParse};
    ['r', 'w'].forEach(function (mode) {
        structure[mode] = this[mode].test(pathToParse);
    }, config.examplePaths);
    return structure;
}

/**
 * @param {String} fullPath to the directory
 * @param {{r: boolean}} structure with readability flag
 * @param {Function} callback
 */
function getDirectory (fullPath, structure, callback) {
    if (!structure.r) {
        callback(new Error(403));
        return;
    }
    fs.readdir(fullPath, function (err, paths) {
        if (err) {
            callback(err);
            return;
        }
        structure.content = buildPathsStructure(paths);
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
