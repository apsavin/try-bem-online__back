var vows = require('vows'),
    assert = require('assert'),
    project = require('../lib/project'),
    fs = require('fs'),
    path = require('path'),
    config = require('../lib/configurator').process(require('../config/config'));

vows.describe('try-bem-online__back').addBatch({
    'module project': {
        'method create': {
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
        },
        'method get, empty path': {
            topic: function () {
                var callback = this.callback;
                project.create(function (err, projectId) {
                    project.get(projectId, '', function (err, structure) {
                        callback(null, {err: err, structure: structure})
                    });
                });
            },

            'should be ok': function (result) {
                assert.equal(result.err, null);
            },

            'should return structure with r, w flags and content field': function (result) {
                assert.strictEqual(typeof result.structure === 'object', true);
                assert.strictEqual(result.structure.r, true);
                assert.strictEqual(result.structure.w, false);
                assert.strictEqual(Array.isArray(result.structure.content), true);
                assert.strictEqual(result.structure.content.length, 6);
            },

            'should contain r .bem in content as first folder': function (result) {
                var firstFolder = result.structure.content[0];
                assert(firstFolder);
                assert.strictEqual(firstFolder.r, true);
                assert.strictEqual(firstFolder.w, false);
                assert.strictEqual(firstFolder.content, '.bem');
            }
        },
        'method get, dir path': {
            topic: function () {
                var callback = this.callback;
                project.create(function (err, projectId) {
                    project.get(projectId, 'desktop.blocks', function (err, structure) {
                        callback(null, {err: err, structure: structure})
                    });
                });
            },

            'should be ok': function (result) {
                assert.equal(result.err, null);
            },

            'should return structure with r, w flags and content field': function (result) {
                assert.strictEqual(typeof result.structure === 'object', true);
                assert.strictEqual(result.structure.r, true);
                assert.strictEqual(result.structure.w, false);
                assert.strictEqual(Array.isArray(result.structure.content), true);
                assert.strictEqual(result.structure.content.length, 1);
            },

            'should contain r .bem in content as only folder': function (result) {
                var firstFolder = result.structure.content[0];
                assert(firstFolder);
                assert.strictEqual(firstFolder.r, true);
                assert.strictEqual(firstFolder.w, false);
                assert.strictEqual(firstFolder.content, '.bem');
            }
        },
        'method get, file path': {
            topic: function () {
                var callback = this.callback;
                project.create(function (err, projectId) {
                    project.get(projectId, 'desktop.bundles/index/index.bemjson.js', function (err, structure) {
                        callback(null, {err: err, structure: structure})
                    });
                });
            },

            'should be ok': function (result) {
                assert.equal(result.err, null);
            },

            'should return structure with r, w flags and content field': function (result) {
                assert.strictEqual(typeof result.structure === 'object', true);
                assert.strictEqual(result.structure.r, true);
                assert.strictEqual(result.structure.w, true);
                assert.strictEqual(typeof result.structure.content, 'string');
                assert(result.structure.content.length);
            }
        },
        'method write, writable path': {
            topic: function () {
                var callback = this.callback;
                project.create(function (err, projectId) {
                    var path = 'desktop.bundles/index/index.bemjson.js',
                        content = "({block: 'page', title: 'some title'})";
                    project.write(projectId, path, content, function (err, structure) {
                        callback(null, {err: err, structure: structure})
                    });
                });
            },

            'should be ok': function (result) {
                assert.equal(result.err, null);
            },

            'should return structure with r, w flags and content field': function (result) {
                assert.strictEqual(typeof result.structure === 'object', true);
                assert.strictEqual(result.structure.r, true);
                assert.strictEqual(result.structure.w, true);
                assert.strictEqual(typeof result.structure.content, 'string');
                assert(result.structure.content.length);
            }
        },
        'method write, non-writable path': {
            topic: function () {
                var callback = this.callback;
                project.create(function (err, projectId) {
                    var path = 'desktop.bundles/.bem/index.bemjson.js',
                        content = "({block: 'page', title: 'some title'})";
                    project.write(projectId, path, content, function (err, structure) {
                        callback(null, {err: err, structure: structure})
                    });
                });
            },

            'should throw': function (result) {
                assert.notEqual(result.err, null);
            }
        },
        'method build': {
            topic: function () {
                var callback = this.callback;
                project.create(function (err, projectId) {
                    project.build(projectId, function (err, projectId) {
                        callback(null, {err: err, projectId: projectId})
                    });
                });
            },

            'should be ok': function (result) {
                assert.equal(result.err, null);
            },

            'should return projectId': function (result) {
                assert.strictEqual(typeof result.projectId === 'string', true);
                assert(result.projectId.length);
            }
        }
    }
}).export(module);
