var fs = require('fs-extra'),
    esprima = require('esprima'),
    vm = require('vm'),
    path = require('path'),
    HttpError = require('../error').HttpError,
    projectUtils = require('./utils'),
    getFullPath = projectUtils.getFullPath,
    buildPathStructure = projectUtils.buildPathStructure,
    JS_EXT = '.js',
    BEMJSON_EXT = '.bemjson';

/**
 * @param {String} projectId
 * @param {String} pathToFile
 * @param {String} data
 * @param {Function} callback
 */
exports.write = function (projectId, pathToFile, data, callback) {
    var fullPath = getFullPath(projectId, pathToFile),
        structure = buildPathStructure(pathToFile);
    if (!structure.w) {
        process.nextTick(function () {
            callback(new HttpError(403, 'Not enough rights to write %s', pathToFile));
        });
        return;
    }
    if (path.extname(pathToFile) === JS_EXT) {
        try {
            esprima.parse(data);
            if (path.extname(path.basename(pathToFile, JS_EXT)) === BEMJSON_EXT) {
                vm.runInNewContext(data);
            }
        } catch (e) {
            process.nextTick(function () {
                callback(new HttpError(400, e.toString()));
            });
            return;
        }
    }
    fs.writeFile(fullPath, data, function (err) {
        callback(err, structure);
    });
};
