var express = require('express'),
    project = require('./lib/project'),
    bemConfig = require('./config/bem'),
    handleErrors = require('./lib/error').handleErrors,
    projectRegExp = /^\/project\/([\w-]+)$/,
    projectResourceRegExp = /^\/project\/([\w-]+)\/([\w\.\-\/]*)$/,
    PROJECT_TTL = 3,//hours
    app = express();

//middleware

app.use(express.bodyParser());

//routes

app.post('/project', createProject);
app.delete('/old_projects', deleteOldProjects);
app.get(projectRegExp, getProjectFile);
app.get(projectResourceRegExp, getProjectFile);
app.post(projectRegExp, handleProjectAction);
app.post(projectResourceRegExp, writeProjectFile);
app.get('/techs', getTechs);
app.post('/block', createBemEntity);

//routes definitions

/**
 * @param {Request} req
 * @param {Response} res
 */
function createProject (req, res) {
    project.create(handleErrors(res, function (id) {
        res.send(201, {id: id});
    }));
}

/**
 * @param {Request} req
 * @param {Response} res
 */
function deleteOldProjects (req, res) {
    var removeDate = new Date();
    removeDate.setHours(removeDate.getHours() - PROJECT_TTL);
    project.removeOld(removeDate, handleErrors(res, function () {
        res.send(200);
    }));
}

/**
 * @param {Request} req
 * @param {Response} res
 */
function getProjectFile (req, res) {
    var projectId = req.params[0],
        path = req.params[1];
    project.get(projectId, path, handleErrors(res, function (data) {
        res.send(data);
    }));
}

/**
 * @param {Request} req
 * @param {Response} res
 */
function handleProjectAction (req, res) {
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
}

/**
 * @param {Request} req
 * @param {Response} res
 */
function writeProjectFile (req, res) {
    project.write(req.params[0], req.params[1], req.body.content, handleErrors(res, function (data) {
        res.send(data);
    }));
}

/**
 * @param {Request} req
 * @param {Response} res
 */
function getTechs (req, res) {
    res.send(bemConfig.availableTechs);
}

/**
 * @param {Request} req
 * @param {Response} res
 */
function createBemEntity (req, res) {
    var params = {};
    bemConfig.declKeys.forEach(function (param) {
        params[param] = req.param(param);
    });
    project.createBemEntity(req.param('projectId'), params, handleErrors(res, function (data) {
        res.send(data);
    }));
}

app.listen(3001);
