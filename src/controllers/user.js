const { tx } = require('./../databases/config');

const bcrypt = require('bcrypt');
const hbs = require('nodemailer-express-handlebars');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const util = require('./../utils/');
const response = require('./../utils/response');
const { transporter } = require('./../utils/transporter');

const { createData, updateData, deleteData } = require('./../utils/crud');
const userModel = require('../models/user');

const getUser = async (req, res) => {
  try {
    const result = await userModel.getUserInfo(req);
    if (result.success) {
      response(res, 200, 'Successfully get user info', result.success, result.data || []);
    } else {
      response(res, 500, 'Failed to get user info', result.success, result.data);
    }
  } catch (error) {
    response(res, 500, 'Failed to get user info');
  }
};

module.exports = {
  getUser,
};
