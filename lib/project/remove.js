var fs = require('fs-extra'),
    projectUtils = require('./utils'),
    getFullPath = projectUtils.getFullPath,
    getDateOfCreation = require('./id').getDateOfCreation,
    tmpPath = projectUtils.appPaths.tmpPath,
    asyncEach = require('../asyncEach');

var getOldProjects = function (since, projectsIds) {
        return projectsIds.filter(function (projectId) {
            return getDateOfCreation(projectId) < since;
        });
    };


/**
 * @param {String} projectId
 * @param {Function} callback
 */
var remove = exports.remove = function (projectId, callback) {
    fs.remove(getFullPath(projectId), callback);
};

/**
 * @param {Date} since
 * @param {Function} callback
 */
exports.removeOld = function (since, callback) {
    fs.readdir(tmpPath, function (err, projectsIds) {
        if (err) {
            callback(err);
            return;
        }
        asyncEach(getOldProjects(since, projectsIds), remove, callback);
    });
};