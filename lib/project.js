var fs = require('fs-extra'),
    path = require('path'),
    difference = require('lodash.difference'),
    toBase64 = require('./toBase64'),
    appPaths = require('./appPathsResolver').process(require('../config/appPaths')),
    bemConfig = require('../config/bem'),
    examplePathsConfig = require('../config/examplePaths');

init();

var examplePaths = generateFullPaths(appPaths.examplePath),
    exampleDirStructure;

/**
 * @param {Function} callback
 */
exports.create = function (callback) {
    var id = getProjectId(),
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
 * @param {String} projectId
 * @param {String} [relativePath]
 */
function getFullPath (projectId, relativePath) {
    return path.join(appPaths.tmpPath, projectId, relativePath == null ? '' : String(relativePath));
}

function init () {
    if (!fs.existsSync(appPaths.examplePath)) {
        throw new Error('path ' + appPaths.examplePath + ' is not exist');
    }
    if (!fs.existsSync(appPaths.tmpPath)) {
        fs.mkdirSync(appPaths.tmpPath);
    }

    var exampleProjectPaths = fs.readdirSync(appPaths.examplePath);

    examplePathsConfig.copied = difference(exampleProjectPaths, examplePathsConfig.excluded, examplePathsConfig.symlinked);

    exampleDirStructure = {
        r: true,
        w: false,
        content: buildPathsStructure(examplePathsConfig.copied.concat(examplePathsConfig.symlinked).sort())
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
    }, examplePathsConfig);

    return paths;
}

/**
 * @returns {String}
 */
function getProjectId () {
    return [Date.now(), Math.random() * Math.pow(10, 18)]
        .map(toBase64)
        .join('');
}

/**
 * @param {Array.<String>} dirStructure
 * @param {String} [relativePath] = ''
 * @returns {Array.<{r: boolean, w: boolean, content: String}>}
 */
function buildPathsStructure (dirStructure, relativePath) {
    relativePath = relativePath || '';
    return dirStructure.map(function (filePath) {
        return {
            path: filePath,
            relativePath: path.join(relativePath, filePath)
        }
    }).map(buildPathStructure);
}

/**
 * @param {{path: String, relativePath: String}|String} filePaths
 * @returns {{r: boolean, w: boolean, content: String}}
 */
function buildPathStructure (filePaths) {
    if (typeof filePaths === 'string') {
        filePaths = {
            path: filePaths,
            relativePath: filePaths
        };
    }
    var structure = {content: filePaths.path};
    ['r', 'w'].forEach(function (mode) {
        structure[mode] = this[mode].test(filePaths.relativePath);
    }, examplePathsConfig);
    return structure;
}

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

var bemPath = path.join(appPaths.examplePath, 'node_modules/bem'),
    bemExecPath = path.join(bemPath, 'bin/bem'),
    exec = require('child_process').exec;

/**
 * @param {String} projectId
 * @param {Function} callback
 * @param {String} [method]
 */
function bemMake (projectId, callback, method) {
    method = method ? ' -m ' + method : '';
    //todo: replace with api call (https://github.com/bem/bem-tools/issues/553)
    exec(bemExecPath + ' make -r ' + getFullPath(projectId) + method, function (err) {
        callback(err, projectId)
    });
}

/**
 * @param {String} projectId
 * @param {Function} callback
 */
exports.build = function (projectId, callback) {
    bemMake(projectId, callback);
};

/**
 * @param {String} projectId
 * @param {Function} callback
 */
exports.clean = function (projectId, callback) {
    bemMake(projectId, callback, 'clean');
};

var bem = require(bemPath).api,
    bemUtils = require(path.join(bemPath, 'lib/util')),
    getPathFromBemDecl = function (decl) {
        var output = path.join(bemConfig.blocksLevelName, decl.block);
        if (decl.elem) {
            output = path.join(output, '__' + decl.elem);
        }
        if (decl.modName) {
            output = path.join(output, '_' + decl.modName);
        }
        return path.join(output, bemUtils.bemFullKey({
            block: decl.block,
            elem: decl.elem,
            mod: decl.modName,
            val: decl.modVal,
            tech: decl.tech
        }));
    };

/**
 * @param {String} projectId
 * @param {Object} decl
 * @param {Function} callback
 */
exports.createBemEntity = function (projectId, decl, callback) {
    if (!projectId || !decl.block || !decl.tech || bemConfig.availableTechs.indexOf(decl.tech) < 0) {
        callback(new Error(400));
    }
    bem.create({
        level: getFullPath(projectId, bemConfig.blocksLevelName),
        block: decl.block,
        elem: decl.elem,
        mod: decl.modName,
        val: decl.modVal,
        forceTech: decl.tech
    })
        .then(function () {
            callback(null, {
                projectId: projectId,
                path: getPathFromBemDecl(decl)
            });
        }, function (err) {
            if (/^Already exists/.test(err)) {
                callback(new Error(400));
                return;
            }
            callback(err);
        });
};
