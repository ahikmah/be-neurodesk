const Router = require("express").Router();
const pingRouter = require("./ping");
const authRouter = require('./auth');
const userRouter = require('./user');
const ticketRouter = require('./ticket');

Router.use('/ping', pingRouter);
Router.use('/auth', authRouter);
Router.use('/user', userRouter);
Router.use('/ticket', ticketRouter);


module.exports = Router;