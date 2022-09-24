const Router = require('express').Router();
const handlers = require('../controllers/ticket');
const authentication = require('../middlewares/authentication');
const multer = require('../middlewares/multer');

Router.get('/all', authentication.checkAccessToken, handlers.getAllTicket);

Router.post(
  '/submit',
  authentication.checkAccessToken,
  multer.errorMulterHandler(multer.uploadItemAttachment.single('attachment')),
  handlers.submitTicket
);

Router.post(
  '/reply',
  authentication.checkAccessToken,
  multer.errorMulterHandler(multer.uploadItemAttachment.single('attachment')),
  handlers.replyTicket
);

Router.patch('/update', authentication.checkAccessTokenAdmin, handlers.updateTicket);

module.exports = Router;