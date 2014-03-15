var project = require('./project'),
    path = require('path'),
    Cache = require('./cache').constructor,
    cache = new Cache();

/**
 * @param {String} projectId
 * @param {Function} callback
 */
exports.exists = function (projectId, callback) {
    var projectCache = cache.get(projectId);
    if (!projectCache) {
        project.exists(projectId, function (exists) {
            if (exists) {
                var projectCache = cache.get(projectId) || {};
                cache.set(projectId, projectCache);
            }
            callback(exists);
        });
        return;
    }
    callback(true);
};

/**
 * @param {String} projectId
 * @param {String} projectPath=''
 * @param {Function} callback
 */
exports.get = function (projectId, projectPath, callback) {
    projectPath = projectPath || '';
    var pathCacheName = path.join('PATH', projectId, projectPath),
        pathCache = cache.get(pathCacheName);
    if (!pathCache) {
        project.get(projectId, projectPath, function (err, data) {
            if (err) {
                callback(err);
                return;
            }
            var projectCache = cache.get(projectId) || {};
            projectCache[pathCacheName] = true;
            cache.set(projectId, projectCache);
            cache.set(pathCacheName, data);
            callback(null, data);
        });
    } else {
        callback(null, pathCache);
    }
};

/**
 * @param {String} projectId
 */
var remove = function (projectId) {
    var projectCache = cache.get(projectId);
    if (!projectCache) {
        return;
    }
    for (var projectPath in projectCache) {
        if (projectCache.hasOwnProperty(projectPath)) {
            cache.remove(projectPath);
        }
    }
    cache.remove(projectId);
};

/**
 * @param {Date} since
 * @param {Function} callback
 */
exports.removeOld = function (since, callback) {
    project.removeOld(since, function (err, oldProjectsIds) {
        callback(err, oldProjectsIds);
        if (Array.isArray(oldProjectsIds)) {
            oldProjectsIds.forEach(remove)
        }
    });
};
