const Router = require("express").Router();
const pingRouter = require("./ping");
const authRouter = require('./auth');
const userRouter = require('./user');

Router.use('/ping', pingRouter);
Router.use('/auth', authRouter);
Router.use('/user', userRouter);


module.exports = Router;