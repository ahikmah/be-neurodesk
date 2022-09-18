/* eslint-disable require/first */
require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const Router = require("./src/routers/router");
const cors = require("cors");
const response = require('./src/utils/response');
const http = require('http');
app.use(cors());

app.use(morgan('dev'));
app.use(express.json());
app.use(express.raw());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const port = process.env.PORT;

app.use(Router);

app.use((req, res) => {
  response(res, 404, "services not found");
});

const server = http.createServer(app);

server.listen(port, () => {
  console.log("Server Running at Port", port);
});
