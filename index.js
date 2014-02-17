var express = require('express'),
    project = require('./lib/project'),
    app = express();

app.use(express.bodyParser());

app.post('/project', function (req, res) {
    project.create(function (err, id) {
        if (err) {
            res.send(500, err);
        }
        //todo: replace with 201
        res.send(200, {id: id});
    })
});

/**
 * @param {Error} err
 * @param {http.ServerResponse} res
 * @param {String} projectId
 * @param {String} path
 */
function handleFileError (err, res, projectId, path) {
    if (err.message === '404' || err.message === '403') {
        res.send(err.message, projectId + '/' + path);
    } else {
        res.send(500, err.message);
    }
}

function onGetProjectFileRequest (req, res) {
    project.get(req.params[0], req.params[1], function (err, data) {
        if (err) {
            handleFileError(err, res, req.params[0], req.params[1]);
            return;
        }
        res.send(data);
    });
}

app.get(/^\/project\/([\w-]+)$/, onGetProjectFileRequest);

var projectFilePathRegExp = /^\/project\/([\w-]+)\/([\w\.\-\/]*)$/;

app.get(projectFilePathRegExp, onGetProjectFileRequest);
app.post(projectFilePathRegExp, function (req, res) {
    project.write(req.params[0], req.params[1], req.body, function (err, data) {
        if (err) {
            handleFileError(err, res, req.param[0], req.param[1]);
            return;
        }
        res.send(data);
    });
});

app.listen(3001);
