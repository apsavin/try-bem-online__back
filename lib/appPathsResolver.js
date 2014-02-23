var path = require('path');

exports.process = function (config) {
    var projectDir = path.dirname(path.join(__dirname, '..'));
    config.examplePath = path.join(projectDir, config.exampleDir);
    config.tmpPath = path.join(projectDir, config.tmpDir);
    return config;
};