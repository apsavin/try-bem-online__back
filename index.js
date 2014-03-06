var express = require('express'),
    project = require('./lib/project'),
    bemConfig = require('./config/bem'),
    handleErrors = require('./lib/error').handleErrors,
    app = express();

app.use(express.bodyParser());

app.post('/project', function (req, res) {
    project.create(handleErrors(res, function (id) {
        res.send(201, {id: id});
    }));
});

function onGetProjectFileRequest (req, res) {
    var projectId = req.params[0],
        path = req.params[1];
    project.get(projectId, path, handleErrors(res, function (data) {
        res.send(data);
    }));
}

var projectRegExp = /^\/project\/([\w-]+)$/,
    projectResourceRegExp = /^\/project\/([\w-]+)\/([\w\.\-\/]*)$/;

app.get(projectRegExp, onGetProjectFileRequest);
app.post(projectRegExp, function (req, res) {
    var projectId = req.params[0],
        callback = handleErrors(res, function (id, queueNumber) {
            res.send({
                id: id,
                queue: queueNumber
            });
        });
    switch (req.param('action')) {
        case 'build':
            project.build(projectId, callback);
            break;
        case 'clean':
            project.clean(projectId, callback);
            break;
        case 'status':
            project.status(projectId, req.param('method'), parseInt(req.param('queue')), callback);
            break;
        default :
            res.send(400, 'No such action: ' + req.param('action'));
    }
});


app.get(projectResourceRegExp, onGetProjectFileRequest);
app.post(projectResourceRegExp, function (req, res) {
    project.write(req.params[0], req.params[1], req.body.content, handleErrors(res, function (data) {
        res.send(data);
    }));
});

app.get('/techs', function (req, res) {
    res.send(bemConfig.availableTechs);
});

app.post('/block', function (req, res) {
    var params = {};
    bemConfig.declKeys.forEach(function (param) {
        params[param] = req.param(param);
    });
    project.createBemEntity(req.param('projectId'), params, handleErrors(res, function (data) {
        res.send(data);
    }));
});

app.listen(3001);
