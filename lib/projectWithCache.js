var project = require('./project'),
    path = require('path'),
    Cache = require('./cache').constructor,
    cache = new Cache(),
    HttpError = require('./error').HttpError,
    BUNDLES_DIR = require('../config/examplePaths').bundles;

/**
 * @param {String} projectId
 * @param {Function} callback
 */
var exists = exports.exists = function (projectId, callback) {
    var projectCache = cache.get(projectId);
    if (!projectCache) {
        project.exists(projectId, function (exists) {
            if (exists) {
                var projectCache = cache.get(projectId) || {};
                cache.set(projectId, projectCache);
            }
            callback(exists);
        });
    } else {
        process.nextTick(function () {
            callback(true);
        });
    }
};

/**
 * @param {String} projectId
 * @returns HttpError
 */
var get404 = function (projectId) {
    return new HttpError(404, 'No such project: ' + projectId);
};

/**
 * @param {String} projectId
 * @param {String} projectPath
 * @returns {String}
 */
var getCacheKey = function (projectId, projectPath) {
    return path.join('PATH', projectId, projectPath);
};

/**
 * @param {String} projectId
 * @param {String} projectPath=''
 * @param {Function} callback
 */
exports.get = function (projectId, projectPath, callback) {
    projectPath = projectPath || '';
    var pathCacheName = getCacheKey(projectId, projectPath),
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
        process.nextTick(function () {
            callback(null, pathCache);
        });
    }
};

/**
 * @param {String} projectId
 * @param {String} [projectPath]
 */
var invalidateCache = function (projectId, projectPath) {
    var projectCache = cache.get(projectId);
    if (!projectCache) {
        return;
    }
    var registeredPathCacheKey;
    if (!projectPath) {
        for (registeredPathCacheKey in projectCache) {
            if (projectCache.hasOwnProperty(registeredPathCacheKey)) {
                cache.remove(registeredPathCacheKey);
            }
        }
        cache.remove(projectId);
        return;
    }
    var pathCacheKey = getCacheKey(projectId, projectPath),
        dirCacheKey = path.dirname(pathCacheKey),
        dirParentCacheKey = path.dirname(dirCacheKey);
    if (projectCache[dirCacheKey]) {
        cache.remove(dirCacheKey);
    }
    if (projectCache[dirParentCacheKey]) {
        cache.remove(dirParentCacheKey);
    }
    cache.remove(pathCacheKey);
};

/**
 * @param {Date} since
 * @param {Function} callback
 */
exports.removeOld = function (since, callback) {
    project.removeOld(since, function (err, oldProjectsIds) {
        callback(err, oldProjectsIds);
        if (Array.isArray(oldProjectsIds)) {
            oldProjectsIds.forEach(invalidateCache)
        }
    });
};

/**
 * @param {String} projectId
 * @param {Object} params
 * @param {Function} callback
 */
exports.createBemEntity = function (projectId, params, callback) {
    exists(projectId, function (exists) {
        if (exists) {
            project.createBemEntity(projectId, params, function (err, data) {
                callback(err, data);
                if (!err) {
                    invalidateCache(data.projectId, data.path);
                }
            });
        } else {
            callback(get404(projectId));
        }
    });
};

/**
 * @param {String} projectId
 * @param {String} path
 * @param {String} content
 * @param {Function} callback
 */
exports.write = function (projectId, path, content, callback) {
    exists(projectId, function (exists) {
        if (exists) {
            project.write(projectId, path, content, function (err, data) {
                callback(err, data);
                if (!err) {
                    invalidateCache(projectId, path);
                }
            });
        } else {
            callback(get404(projectId));
        }
    });
};

/**
 * @param {String} projectId
 */
var invalidateBundlesCache = function (projectId) {
    var projectCache = cache.get(projectId);
    if (!projectCache) {
        return;
    }
    var registeredPathCacheKey;
    for (registeredPathCacheKey in projectCache) {
        if (projectCache.hasOwnProperty(registeredPathCacheKey)) {
            cache.remove(registeredPathCacheKey);
        }
    }
};

/**
 * @param {String} projectId
 * @param {String} method
 * @param {Function} callback
 */
var make = function (projectId, method, callback) {
    exists(projectId, function (exists) {
        if (exists) {
            project[method](projectId, function (err, data) {
                callback(err, data);
                invalidateBundlesCache(projectId);
            });
        } else {
            callback(get404(projectId));
        }
    });
};

/**
 * @param {String} projectId
 * @param {Function} callback
 */
exports.build = function (projectId, callback) {
    make(projectId, 'build', callback);
};

/**
 * @param {String} projectId
 * @param {Function} callback
 */
exports.clean = function (projectId, callback) {
    make(projectId, 'clean', callback);
};

/**
 * @param {String} projectId
 * @param {String} method
 * @param {Number} queue
 * @param {Function} callback
 */
exports.status = function (projectId, method, queue, callback) {
    exists(projectId, function (exists) {
        if (exists) {
            project.status(projectId, method, queue, callback);
        } else {
            callback(get404(projectId));
        }
    });
};