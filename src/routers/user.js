const Router = require('express').Router();
const handlers = require('./../controllers/user');
const authentication = require('./../middlewares/authentication');
const validator = require('./../middlewares/inputValidator');

Router.get('/', authentication.checkAccessToken, handlers.getUser);

module.exports = Router;
