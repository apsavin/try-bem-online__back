var fs = require('fs-extra'),
    path = require('path'),
    appPaths = exports.appPaths = require('./../appPathsResolver').process(require('../../config/appPaths')),
    examplePathsConfig = require('../../config/examplePaths'),
    exampleDirStructure = {
        r: true,
        w: false
    };

/**
 * @param {{path: String, relativePath: String}|String} filePaths
 * @returns {{r: boolean, w: boolean, content: String}}
 */
var buildPathStructure = exports.buildPathStructure = function (filePaths) {
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
};

/**
 * @param {Array.<String>} dirStructure
 * @param {String} [relativePath] = ''
 * @returns {Array.<{r: boolean, w: boolean, content: String}>}
 */
var buildPathsStructure = exports.buildPathsStructure = function (dirStructure, relativePath) {
    relativePath = relativePath || '';
    return dirStructure.map(function (filePath) {
        return {
            path: filePath,
            relativePath: path.join(relativePath, filePath)
        }
    }).map(buildPathStructure);
};

/**
 * @param {String} projectId
 * @param {String} [relativePath]
 */
exports.getFullPath = function (projectId, relativePath) {
    return path.join(appPaths.tmpPath, projectId, relativePath == null ? '' : String(relativePath));
};

if (!fs.existsSync(appPaths.examplePath)) {
    throw new Error('path ' + appPaths.examplePath + ' is not exist');
}
if (!fs.existsSync(appPaths.tmpPath)) {
    fs.mkdirSync(appPaths.tmpPath);
}

exampleDirStructure.content = buildPathsStructure(examplePathsConfig.copied
    .concat(examplePathsConfig.symlinked)
    .map(function (path) {
        return path.split('/')[0]
    })
    .filter(function (path, i, arr) {
        return arr.lastIndexOf(path) === i;
    }).sort());

exports.examplePathsConfig = examplePathsConfig;

exports.exampleDirStructure = exampleDirStructure;