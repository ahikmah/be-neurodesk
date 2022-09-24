const Router = require('express').Router();
const handlers = require('./../controllers/user');
const authentication = require('./../middlewares/authentication');
const validator = require('./../middlewares/inputValidator');

Router.get('/', authentication.checkAccessToken, handlers.getUser);
Router.get('/all', authentication.checkAccessToken, handlers.getAllUser);

Router.post('/', authentication.checkAccessTokenSuperAdmin, handlers.createUsers);

Router.patch('/', authentication.checkAccessTokenAdmin, validator.updateValidator(), validator.validate, handlers.updateUser);
Router.patch('/update-profile', authentication.checkAccessToken, handlers.updateProfile);

Router.delete('/delete/:id', authentication.checkAccessTokenSuperAdmin, handlers.deleteUser);
module.exports = Router;
