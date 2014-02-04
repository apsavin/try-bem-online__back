var vows = require('vows'),
    assert = require('assert'),
    project = require('../lib/project'),
    fs = require('fs'),
    path = require('path'),
    config = require('../lib/configurator').process(require('../config/config'));

vows.describe('try-bem-online__back').addBatch({
    'projects module': {
        'generate method': {
            topic: function () {
                var callback = this.callback;
                project.create(function (err, projectId) {
                    callback(null, {err: err, projectId: projectId});
                });
            },

            'should be ok': function (result) {
                assert.equal(result.err, null);
            },

            'should return id of created project': function (result) {
                assert.ok(result.projectId);
            },

            'should create project directory': function (result) {
                assert(fs.existsSync(path.join(config.tmpPath, result.projectId)));
            }
        }
    }
}).export(module);