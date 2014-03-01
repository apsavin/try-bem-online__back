var express = require('express'),
    project = require('./lib/project'),
    bemConfig = require('./config/bem'),
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
 * @param {String} [path]
 */
function handleFileError (err, res, projectId, path) {
    if (err.message === '404' || err.message === '403') {
        var response = path ? projectId + '/' + path : projectId;
        res.send(err.message, response);
    } else {
        console.log(err);
        res.send(500, err.message);
    }
}

function onGetProjectFileRequest (req, res) {
    var projectId = req.params[0],
        path = req.params[1];
    project.get(projectId, path, function (err, data) {
        if (err) {
            handleFileError(err, res, projectId, path);
            return;
        }
        res.send(data);
    });
}

var projectRegExp = /^\/project\/([\w-]+)$/,
    projectResourceRegExp = /^\/project\/([\w-]+)\/([\w\.\-\/]*)$/;

app.get(projectRegExp, onGetProjectFileRequest);
app.post(projectRegExp, function (req, res) {
    var projectId = req.params[0],
        callback = function (err, id, queueNumber) {
            if (err) {
                handleFileError(err, res, projectId);
                return;
            }
            res.send(200, {
                id: id,
                queue: queueNumber
            });
        };
    switch (req.param('action')) {
        case 'build':
            project.build(projectId, callback);
            break;
        case 'clean':
            project.clean(projectId, callback);
            break;
        case 'status':
            project.status(projectId, req.param('method'), callback);
            break;
        default :
            res.send(400, 'No such action');
    }
});


app.get(projectResourceRegExp, onGetProjectFileRequest);
app.post(projectResourceRegExp, function (req, res) {
    project.write(req.params[0], req.params[1], req.body.content, function (err, data) {
        if (err) {
            handleFileError(err, res, req.param[0], req.param[1]);
            return;
        }
        res.send(data);
    });
});

app.get('/techs', function (req, res) {
    res.send(200, bemConfig.availableTechs);
});

app.post('/block', function (req, res) {
    var params = {};
    bemConfig.declKeys.forEach(function (param) {
        params[param] = req.param(param);
    });
    project.createBemEntity(req.param('projectId'), params, function (err, data) {
        if (err) {
            if (err.message === '400') {
                res.send(err.message, 'Wrong arguments');
            } else {
                console.log(err);
                res.send(500, err.message);
            }
            return;
        }
        res.send(200, data);
    });
});

app.listen(3001);
