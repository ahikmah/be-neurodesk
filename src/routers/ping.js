const Router = require("express").Router();
const handlers = require('./../controllers/ping')

Router.get('/',handlers.ping);


module.exports =Router;