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
    project.get(req.params.project, req.params.path, function (err, data) {
        if (err) {
            res.send(500, err);
        }
        res.send(data);
    });
};

app.get('/clones/:project', onGetProjectFileRequest);

app.get('/clones/:project/:path', onGetProjectFileRequest);

app.listen(3001);
