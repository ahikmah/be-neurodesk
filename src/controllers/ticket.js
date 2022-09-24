const { tx } = require('../databases/config');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');

const util = require('../utils');
const response = require('../utils/response');
const { transporter } = require('../utils/transporter');

const { createData, updateData, deleteData } = require('../utils/crud');
const ticketModel = require('../models/ticket');

const getAllTicket = async (req, res) => {
  const page = parseInt(req.query?.page);
  const offset = parseInt(req.query?.offset);

  try {
    const result = await ticketModel.getAllTicket(req);
    if (result.success) {
      const countData = { total: result.data.rowCount > 0 ? parseInt(result.data.rows[0].totalcount) : 0, page, offset };
      response(res, 200, 'Successfully get list of ticket', result.success, result.data.rows, page && countData);
    } else {
      response(res, 500, 'Failed to get list of ticket', result.success, result.data);
    }
  } catch (error) {
    response(res, 500, 'Failed to get user info');
  }
};

module.exports = {
  getAllTicket,
};
