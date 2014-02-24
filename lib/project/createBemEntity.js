var path = require('path'),
    projectUtils = require('./utils'),
    appPaths = projectUtils.appPaths,
    getFullPath = projectUtils.getFullPath,
    bemConfig = require('../../config/bem'),
    bemPath = path.join(appPaths.examplePath, 'node_modules/bem'),
    bem = require(bemPath).api,
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
    },
    appKeysToBemKeys = {
        modName: 'mod',
        modVal: 'val',
        tech: 'forceTech'
    };

/**
 * @param {String} projectId
 * @param {Object} decl
 * @param {Function} callback
 */
exports.createBemEntity = function (projectId, decl, callback) {
    if (!isParamsValid(projectId, decl)) {
        callback(new Error(400));
        return;
    }
    var bemCreateParams = {
        level: getFullPath(projectId, bemConfig.blocksLevelName)
    };
    bemConfig.declKeys.forEach(function (key) {
        bemCreateParams[appKeysToBemKeys[key] || key] = decl[key];
    });
    bem.create(bemCreateParams)
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

var isProjectIdValid = projectUtils.isProjectIdValid;

/**
 * @param {String} projectId
 * @param {Object} decl
 * @returns {boolean}
 */
function isParamsValid (projectId, decl) {
    if (!isProjectIdValid(projectId) || !decl.block || !decl.tech || bemConfig.availableTechs.indexOf(decl.tech) < 0) {
        return false;
    }
    return bemConfig.declKeys.every(function (key) {
        return /^([a-z]|[0-9]|\-)*$/.test(decl[key]);
    });
}