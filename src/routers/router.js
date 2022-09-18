const Router = require("express").Router();
const pingRouter = require("./ping");

Router.use('/ping', pingRouter);

module.exports = Router;