const { tx } = require('../databases/config');
const axios = require('axios');

const response = require('../utils/response');

const { createData, updateData, deleteData } = require('../utils/crud');
const ticketModel = require('../models/ticket');
const { TICKET_WS } = process.env;

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
    response(res, 500, 'Failed to get list of ticket');
  }
};
const getTicketDetail = async (req, res) => {
  try {
    const result = await ticketModel.getTicketDetail(req);
    if (result.success) {
      response(res, 200, 'Successfully get ticket detail', result.success, result.data.rows);
    } else {
      response(res, 500, 'Failed to get ticket detail', result.success, result.data);
    }
  } catch (error) {
    response(res, 500, 'Failed to get ticket detail');
  }
};

const submitTicket = async (req, res) => {
  try {
    tx(async (client) => {
      if (req.file) req.body.attachment = req.file.location;
      req.body.submitter_id = req.token.id_user;

      // Get Ticket Prediction
      const pred = await axios.post(`${TICKET_WS}/v1/api/ticket/`, { complaint: req.body.title + ' ' + req.body.description });

      if (pred.status === 200) {
        req.query.division = pred.data.category;
        req.body.category = pred.data.category;
        const getAssignee = await ticketModel.getAssignee(req);
        if (getAssignee.data.rows.length > 0) {
          req.body.assigned_to_id = getAssignee.data.rows[0].id;
        }
      }

      await createData(req.body, 'helpdesk.t_tickets', 'id', client);

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
      if (req.file) req.body.attachment = req.file.location;
      req.body.submitter_id = req.token.id_user;
      await createData(req.body, 'helpdesk.t_ticket_log_replies', 'id', client);

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

const getAllCategory = async (req, res) => {
  const page = parseInt(req.query?.page);
  const offset = parseInt(req.query?.offset);

  try {
    const result = await ticketModel.getAllCategory(req);
    if (result.success) {
      const countData = { total: result.data.rowCount > 0 ? parseInt(result.data.rows[0].totalcount) : 0, page, offset };
      response(res, 200, 'Successfully get list of category', result.success, result.data.rows, page && countData);
    } else {
      response(res, 500, 'Failed to get list of category', result.success, result.data);
    }
  } catch (error) {
    response(res, 500, 'Failed to get list of category');
  }
};

const createCategory = async (req, res) => {
  try {
    tx(async (client) => {
      await createData(req.body, 'helpdesk.t_master_category', 'id', client);

      const dataLog = {
        id_user: req.token.id_user,
        activity: `Create Category`,
        action: 'insert',
        req_query: JSON.stringify(req.query),
        req_params: JSON.stringify(req.params),
        req_body: JSON.stringify(req.body),
      };

      await createData(dataLog, 'helpdesk.t_user_log_activities', 'id', client);

      response(res, 200, 'Successfully create new category', true);
    }, res);
  } catch (error) {
    response(res, 500, 'Failed to create new category');
  }
};

const deleteCategory = async (req, res) => {
  try {
    tx(async (client) => {
      const whereDelete = { id: req.params.id, qs: 'id' };
      await deleteData(whereDelete, 'helpdesk.t_master_category', client);

      const dataLog = {
        id_user: req.token.id_user,
        activity: `Delete a category `,
        action: 'delete',
        req_query: JSON.stringify(req.query),
        req_params: JSON.stringify(req.params),
        req_body: JSON.stringify(req.body),
      };

      await createData(dataLog, 'helpdesk.t_user_log_activities', 'id', client);

      response(res, 200, 'Successfully delete category', true);
    }, res);
  } catch (error) {
    response(res, 500, 'Failed to delete category');
  }
};

module.exports = {
  getAllTicket,
  getTicketDetail,
  submitTicket,
  replyTicket,
  updateTicket,
  getAllCategory,
  createCategory,
  deleteCategory,
};
