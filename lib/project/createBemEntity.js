var path = require('path'),
    projectUtils = require('./utils'),
    bemPath = projectUtils.bemPath,
    bemExecPath = projectUtils.bemExecPath,
    getFullPath = projectUtils.getFullPath,
    HttpError = require('../error').HttpError,
    bemConfig = require('../../config/bem'),
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
    declKeysToBemArgs = {
        modName: '-m',
        modVal: '-v',
        tech: '-T',
        block: '-b',
        elem: '-e'
    },
    exec = require('child_process').exec;

function getBemCreateArgs (projectId, decl) {
    var level = getFullPath(projectId, bemConfig.blocksLevelName);

    return '-l ' + level + ' ' + bemConfig.declKeys.map(function (key) {
        return decl[key] ? declKeysToBemArgs[key] + ' ' + decl[key] : '';
    }).join(' ');
}

/**
 * @param {String} projectId
 * @param {Object} decl
 * @param {Function} callback
 */
exports.createBemEntity = function (projectId, decl, callback) {
    if (!isParamsValid(projectId, decl)) {
        process.nextTick(function () {
            callback(new HttpError(400, 'Not valid params'));
        });
        return;
    }
    exec(bemExecPath + ' create ' + getBemCreateArgs(projectId, decl), function (err) {
        if (err) {
            callback(/^Already exists/.test(err) ?
                new HttpError(400, 'Already exists') :
                new Error('Entity is not created'));
            return;
        }
        callback(null, {
            projectId: projectId,
            path: getPathFromBemDecl(decl)
        });
    });
};

var isProjectIdValid = require('./id').isValid;

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
        return /^([a-z]|[0-9]|\-|\.)*$/.test(decl[key]);
    });
}
