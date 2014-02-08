var express = require('express'),
    project = require('./lib/project'),
    app = express();

app.use(express.bodyParser());

app.post('/clone', function (req, res) {
    project.create(function (err, id) {
        if (err) {
            res.send(500, err);
        }
        res.send({id: id});
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

app.get(/^\/clones\/([\w-]+)$/, onGetProjectFileRequest);

app.get(/^\/clones\/([\w-]+)\/([\w\.\-\/]*)$/, onGetProjectFileRequest);

app.listen(3001);
