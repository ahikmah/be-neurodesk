const Router = require('express').Router();
const handlers = require('./../controllers/auth');
const validator = require('./../middlewares/inputValidator');
const authentication = require('./../middlewares/authentication');

/**
 * Register feature is for SUPERADMINS only.
 * As for other roles, superadmins can add them through the AddUser feature
 */
Router.post('/register', authentication.checkSecretKey, validator.registrationValidator(), validator.validate, handlers.register);
Router.post('/activation', validator.accountActivationValidator(), validator.validate, handlers.accountActivation);
Router.post('/login', validator.loginValidator(), validator.validate, handlers.login);
Router.post('/logout', authentication.checkRefreshTokenLogout, handlers.logoutToken);

/**
 * FORGOT AND REST PASSWORD
 */
Router.post('/forgot-password', validator.forgotPasswordValidator(), validator.validate, handlers.sendEmailResetPassword);
Router.post('/set-password', validator.setPasswordValidator(), validator.validate, handlers.setPassword);
Router.post('/change-password', authentication.checkAccessToken, validator.changePasswordValidator(), validator.validate, handlers.changePassword);

Router.post('/revoke', authentication.checkRefreshToken, handlers.revokeToken);
Router.post('/public-register', validator.registrationValidator(), validator.validate, handlers.registerPublic);

module.exports = Router;
