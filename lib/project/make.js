var path = require('path'),
    projectUtils = require('./utils'),
    appPaths = projectUtils.appPaths,
    getFullPath = projectUtils.getFullPath,
    bemPath = path.join(appPaths.examplePath, 'node_modules/bem'),
    bemExecPath = path.join(bemPath, 'bin/bem'),
    exec = require('child_process').exec;

var makeQueue = {

    /**
     * @type {Array.<ProjectObject>}
     * @private
     */
    _queue: [],

    /**
     * is some project is processing?
     * @type {Boolean}
     * @private
     */
    _busy: false,

    /**
     * @typedef {{projectId: String, callbacks: Array.<Function>, method: String}} ProjectObject
     */

    /**
     * place to store object that is in make process
     * @type {ProjectObject}
     * @private
     */
    _processingProject: null,

    /**
     * @param {String} projectId
     * @param {Function} callback
     * @param {String} [method]
     */
    process: function (projectId, callback, method) {
        var project = {
            projectId: projectId,
            callbacks: [callback],
            method: method || 'make'
        };
        if (this._busy) {
            this._addToQueue(project);
        } else {
            this._make(project);
        }
    },

    /**
     * @param {ProjectObject} project
     * @private
     */
    _addToQueue: function (project) {
        this._notifyAboutQueueChanges(project);
        this._queue.push(project);
    },

    /**
     * @param {ProjectObject} project
     * @private
     */
    _make: function (project) {
        this._busy = true;
        this._processingProject = project;
        var projectPath = getFullPath(project.projectId),
            method = ' -m ' + project.method;
        //todo: replace with api call (https://github.com/bem/bem-tools/issues/553)
        exec(bemExecPath + ' make -r ' + projectPath + method, this._onMake);
    },

    /**
     * @param err
     * @private
     */
    _onMake: function onMake (err) {
        if (this !== makeQueue) {
            onMake.call(makeQueue, err);
            return;
        }
        var p = this._processingProject;
        if (this._queue.length) {
            this._make(this._queue.shift());
            this._queue.forEach(this._notifyAboutQueueChanges, this);
        } else {
            this._busy = false;
        }
        p.callbacks.forEach(function (callback) {
            callback(err, p.projectId);
        });
    },

    /**
     * @param {ProjectObject} project
     * @private
     */
    _notifyAboutQueueChanges: function (project) {
        project.callbacks.forEach(function (callback) {
            callback(null, project.projectId, this._queue.length);
        }, this);
        project.callbacks = [];
    },

    status: function (projectId, method, callback) {
        var inQueue = this._queue.some(function (project) {
            if (project.projectId === projectId && project.method === method) {
                project.callbacks.push(callback);
                return true;
            }
            return false;
        });
        if (!inQueue) {
            callback(null, projectId);
        }
    }

};

/**
 * @param {String} projectId
 * @param {Function} callback
 */
exports.build = function (projectId, callback) {
    makeQueue.process(projectId, callback);
};

/**
 * @param {String} projectId
 * @param {Function} callback
 */
exports.clean = function (projectId, callback) {
    makeQueue.process(projectId, callback, 'clean');
};

/**
 * @param {String} projectId
 * @param {String} method
 * @param {Function} callback
 */
exports.status = function (projectId, method, callback) {
    makeQueue.status(projectId, method, callback);
};