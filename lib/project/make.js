var path = require('path'),
    projectUtils = require('./utils'),
    appPaths = projectUtils.appPaths,
    getFullPath = projectUtils.getFullPath,
    bemPath = path.join(appPaths.examplePath, 'node_modules/bem'),
    bemExecPath = path.join(bemPath, 'bin/bem'),
    exec = require('child_process').exec,
    busyProjectsIds = {};

/**
 * @param {String} projectId
 * @param {Function} callback
 * @param {String} [method]
 */
function bemMake (projectId, callback, method) {
    if (busyProjectsIds[projectId]) {
        callback(new Error('Can not ' + (method ? method : 'build') + ' project: busy with different process.'));
        return;
    }
    busyProjectsIds[projectId] = true;
    method = method ? ' -m ' + method : '';
    //todo: replace with api call (https://github.com/bem/bem-tools/issues/553)
    exec(bemExecPath + ' make -r ' + getFullPath(projectId) + method, function (err) {
        busyProjectsIds[projectId] = false;
        callback(err, projectId);
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