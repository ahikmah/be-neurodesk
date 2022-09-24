const Router = require('express').Router();
const handlers = require('../controllers/ticket');
const authentication = require('../middlewares/authentication');
const validator = require('../middlewares/inputValidator');

Router.get('/all', authentication.checkAccessToken, handlers.getAllTicket);
module.exports = Router;
