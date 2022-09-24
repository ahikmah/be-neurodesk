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

const submitTicket = async (req, res) => {
  try {
    tx(async (client) => {
      req.body.attachment = req.file.location;
      await createData(body, 'helpdesk.t_tickets', client);

      const dataLog = {
        id_user: req.token.id_user,
        activity: `Submit Ticket`,
        action: 'insert',
        req_query: JSON.stringify(req.query),
        req_params: JSON.stringify(req.params),
        req_body: JSON.stringify(req.body),
      };

      await createData(dataLog, 'helpdesk.t_user_log_activities', 'id', client);

      response(res, 200, 'Successfully submit a ticket', true);
    }, res);
  } catch (error) {
    response(res, 500, 'Failed to submit ticket');
  }
};

const replyTicket = async (req, res) => {
  try {
    tx(async (client) => {
      req.body.attachment = req.file.location;
      await createData(body, 'helpdesk.t_ticket_log_replies', client);

      const dataLog = {
        id_user: req.token.id_user,
        activity: `Reply Ticket`,
        action: 'insert',
        req_query: JSON.stringify(req.query),
        req_params: JSON.stringify(req.params),
        req_body: JSON.stringify(req.body),
      };

      await createData(dataLog, 'helpdesk.t_user_log_activities', 'id', client);

      response(res, 200, 'Successfully reply a ticket', true);
    }, res);
  } catch (error) {
    response(res, 500, 'Failed to reply ticket');
  }
};

const updateTicket = async (req, res) => {
  try {
    tx(async (client) => {
      const whereUpdate = { id: req.body.id, qs: 'id' };
      await updateData(whereUpdate, req.body, 'helpdesk.t_tickets', client);

      const dataLog = {
        id_user: req.token.id_user,
        activity: `Update ticket information`,
        action: 'update',
        req_query: JSON.stringify(req.query),
        req_params: JSON.stringify(req.params),
        req_body: JSON.stringify(req.body),
      };

      await createData(dataLog, 'helpdesk.t_user_log_activities', 'id', client);

      response(res, 200, 'Successfully update ticket information', true);
    }, res);
  } catch (error) {
    response(res, 500, 'Failed to update ticket information');
  }
};

module.exports = {
  getAllTicket,
  submitTicket,
  replyTicket,
  updateTicket,
};
