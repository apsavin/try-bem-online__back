var vows = require('vows'),
    assert = require('assert'),
    project = require('../lib/project'),
    fs = require('fs'),
    path = require('path'),
    config = require('../lib/appPathsResolver').process(require('../config/appPaths'));

vows.describe('try-bem-online__back').addBatch({
    'module project': {
        'method create': {
            topic: function () {
                project.create(this.callback);
            },

            'should return id of created project': function (projectId) {
                assert.ok(projectId);
            },

            'should create project directory': function (projectId) {
                assert(fs.existsSync(path.join(config.tmpPath, projectId)));
            },

            'after project creation': {
                'method get, empty path': {
                    topic: function (projectId) {
                        project.get(projectId, '', this.callback);
                    },

                    'should return structure with r, w flags and content field': function (result) {
                        assert.strictEqual(typeof result === 'object', true);
                        assert.strictEqual(result.r, true);
                        assert.strictEqual(result.w, false);
                        assert.strictEqual(Array.isArray(result.content), true);
                        assert.strictEqual(result.content.length, 6);
                    },

                    'should contain r .bem in content as first folder': function (result) {
                        var firstFolder = result.content[0];
                        assert(firstFolder);
                        assert.strictEqual(firstFolder.r, true);
                        assert.strictEqual(firstFolder.w, false);
                        assert.strictEqual(firstFolder.content, '.bem');
                    }
                },
                'method get, dir path': {
                    topic: function (projectId) {
                        project.get(projectId, 'desktop.blocks', this.callback);
                    },

                    'should return structure with r, w flags and content field': function (result) {
                        assert.strictEqual(typeof result === 'object', true);
                        assert.strictEqual(result.r, true);
                        assert.strictEqual(result.w, false);
                        assert.strictEqual(Array.isArray(result.content), true);
                        assert.strictEqual(result.content.length, 1);
                    },

                    'should contain r .bem in content as only folder': function (result) {
                        var firstFolder = result.content[0];
                        assert(firstFolder);
                        assert.strictEqual(firstFolder.r, true);
                        assert.strictEqual(firstFolder.w, false);
                        assert.strictEqual(firstFolder.content, '.bem');
                    }
                },
                'method get, file path': {
                    topic: function (projectId) {
                        project.get(projectId, 'desktop.bundles/index/index.bemjson.js', this.callback);
                    },

                    'should return structure with r, w flags and content field': function (result) {
                        assert.strictEqual(typeof result === 'object', true);
                        assert.strictEqual(result.r, true);
                        assert.strictEqual(result.w, true);
                        assert.strictEqual(typeof result.content, 'string');
                        assert(result.content.length);
                    }
                },
                'method write, writable path': {
                    topic: function (projectId) {
                        var path = 'desktop.bundles/index/index.bemjson.js',
                            content = "({block: 'page', title: 'some title'})";
                        project.write(projectId, path, content, this.callback);
                    },

                    'should return structure with r, w flags and content field': function (result) {
                        assert.strictEqual(typeof result === 'object', true);
                        assert.strictEqual(result.r, true);
                        assert.strictEqual(result.w, true);
                        assert.strictEqual(typeof result.content, 'string');
                        assert(result.content.length);
                    }
                },
                'method write, non-writable path': {
                    topic: function (projectId) {
                        var callback = this.callback,
                            path = 'desktop.bundles/.bem/index.bemjson.js',
                            content = "({block: 'page', title: 'some title'})";
                        project.write(projectId, path, content, function (err, structure) {
                            callback(null, {err: err, structure: structure})
                        });
                    },

                    'should throw': function (result) {
                        assert.notEqual(result.err, null);
                    }
                },
                'method build': {
                    topic: function (projectId) {
                        project.build(projectId, this.callback);
                    },

                    'should return projectId': function (projectId) {
                        assert.strictEqual(typeof projectId === 'string', true);
                        assert(projectId.length);
                    },
                    'method clean': {
                        topic: function (projectId) {
                            project.clean(projectId, this.callback);
                        },

                        'should return projectId': function (projectId) {
                            assert.strictEqual(typeof projectId === 'string', true);
                            assert(projectId.length);
                        }
                    },
                    'method build during clean': {
                        topic: function (projectId) {
                            var callback = this.callback;
                            project.build(projectId, function (err) {
                                callback(null, err);
                            });
                        },

                        'should throw': function (err) {
                            assert.strictEqual(err instanceof Error, true);
                            assert.strictEqual(err.message, 'Can not build project: busy with different process.');
                        }
                    }
                },
                'method clean during build': {
                    topic: function (projectId) {
                        var callback = this.callback;
                        project.clean(projectId, function (err) {
                            callback(null, err);
                        });
                    },

                    'should throw': function (err) {
                        assert.strictEqual(err instanceof Error, true);
                        assert.strictEqual(err.message, 'Can not clean project: busy with different process.');
                    }
                }
            }
        }
    }
}).export(module);
