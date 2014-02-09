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

var onGetProjectFileRequest = function (req, res) {
    project.get(req.params[0], req.params[1], function (err, data) {
        if (err) {
            if (err.message === '404' || err.message === '403') {
                res.send(err.message, err);
            } else {
                res.send(500, err);
            }
            return;
        }
        res.send(data);
    });
};

app.get(/^\/project\/([\w-]+)$/, onGetProjectFileRequest);

app.get(/^\/project\/([\w-]+)\/([\w\.\-\/]*)$/, onGetProjectFileRequest);

app.listen(3001);
