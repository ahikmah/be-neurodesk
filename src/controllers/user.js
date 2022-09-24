const { tx } = require('./../databases/config');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');

const util = require('./../utils/');
const response = require('./../utils/response');
const { transporter } = require('./../utils/transporter');

const { createData, updateData, deleteData } = require('./../utils/crud');
const userModel = require('../models/user');
const { REACT_APP } = process.env;

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

const createUsers = async (req, res) => {
  const { body } = req;
  try {
    tx(async (client) => {
      for (user of body) {
        user.otp = util.otpGenerator();
        const addUser = await createData(user, 'helpdesk.t_users', 'id', client);
        const dataLog = {
          id_user: req.token.id_user,
          activity: `Create a new user`,
          action: 'insert',
          req_query: JSON.stringify(req.query),
          req_params: JSON.stringify(req.params),
          req_body: JSON.stringify(req.body),
        };
        await createData(dataLog, 'helpdesk.t_user_log_activities', 'id', client);

        // SENDING EMAIL
        const handlebarOptions = {
          viewEngine: {
            partialsDir: path.resolve(__dirname, '../view/email/'),
            defaultLayout: false,
          },
          viewPath: path.resolve(__dirname, '../view/email/'),
        };

        // use a template file with nodemailer
        transporter.use('compile', hbs(handlebarOptions));

        var mailOptions = {
          from: '"NEURO DESK" <neurodesk.ai@gmail.com>',
          to: user.email,
          subject: 'Welcome to NeuroDesk!',
          template: 'activation', // the name of the template file i.e email.handlebars
          context: {
            name: user.full_name,
            link: `${REACT_APP}/reset-password?otp=${user.otp}&id=${addUser.data.rows[0].id}`,
          },
        };

        // trigger the sending of the E-mail
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            return console.log(error);
          }
          console.log('Message sent: ' + info.response);
        });
      }
      response(res, 201, 'Successfully create user', true);
    }, res);
  } catch (error) {
    console.log(error);
    response(res, 500, 'Failed to get create user');
  }
};

const getAllUser = async (req, res) => {
  const page = parseInt(req.query?.page);
  const offset = parseInt(req.query?.offset);

  try {
    const result = await userModel.getAllUser(req);
    if (result.success) {
      const countData = { total: result.data.rowCount > 0 ? parseInt(result.data.rows[0].totalcount) : 0, page, offset };
      response(res, 200, 'Successfully get list of users', result.success, result.data.rows, page && countData);
    } else {
      response(res, 500, 'Failed to get list of users', result.success, result.data);
    }
  } catch (error) {
    response(res, 500, 'Failed to get user info');
  }
};

// Update user for Admin
const updateUser = async (req, res) => {
  try {
    if (req.body.password) {
      response(res, 403, 'Forbidden');
    }
    tx(async (client) => {
      const whereUpdate = { id: req.body.id, qs: 'id' };
      await updateData(whereUpdate, req.body, 'helpdesk.t_users', client);

      const dataLog = {
        id_user: req.token.id_user,
        activity: `Update user information`,
        action: 'update',
        req_query: JSON.stringify(req.query),
        req_params: JSON.stringify(req.params),
        req_body: JSON.stringify(req.body),
      };

      await createData(dataLog, 'helpdesk.t_user_log_activities', 'id', client);

      response(res, 200, 'Successfully update user information', true);
    }, res);
  } catch (error) {
    response(res, 500, 'Failed to update user information');
  }
};

// Update profile by user himself
const updateProfile = async (req, res) => {
  try {
    if (req.body.password || req.body.status || req.body.role) {
      response(res, 403, 'Forbidden');
    }
    tx(async (client) => {
      const whereUpdate = { id: req.token.id_user, qs: 'id' };
      await updateData(whereUpdate, req.body, 'helpdesk.t_users', client);

      const dataLog = {
        id_user: req.token.id_user,
        activity: `Update profile`,
        action: 'update',
        req_query: JSON.stringify(req.query),
        req_params: JSON.stringify(req.params),
        req_body: JSON.stringify(req.body),
      };

      await createData(dataLog, 'helpdesk.t_user_log_activities', 'id', client);

      response(res, 200, 'Successfully update profile', true);
    }, res);
  } catch (error) {
    response(res, 500, 'Failed to update profile');
  }
};

const updatePhotoProfile = async (req, res) => {
  try {
    tx(async (client) => {
      const whereUpdate = { id: req.token.id_user, qs: 'id' };
      await updateData(whereUpdate, { photo: req.file.location }, 'helpdesk.t_users', client);

      const dataLog = {
        id_user: req.token.id_user,
        activity: `Update photo profile`,
        action: 'update',
        req_query: JSON.stringify(req.query),
        req_params: JSON.stringify(req.params),
        req_body: JSON.stringify(req.body),
      };

      await createData(dataLog, 'helpdesk.t_user_log_activities', 'id', client);

      response(res, 200, 'Successfully update photo profile', true);
    }, res);
  } catch (error) {
    response(res, 500, 'Failed to update photo profile');
  }
};

const deleteUser = async (req, res) => {
  try {
    tx(async (client) => {
      const whereDelete = { id: req.params.id, qs: 'id' };
      await deleteData(whereDelete, 'helpdesk.t_users', client);

      const dataLog = {
        id_user: req.token.id_user,
        activity: `Delete a user `,
        action: 'delete',
        req_query: JSON.stringify(req.query),
        req_params: JSON.stringify(req.params),
        req_body: JSON.stringify(req.body),
      };

      await createData(dataLog, 'helpdesk.t_user_log_activities', 'id', client);

      response(res, 200, 'Successfully delete user', true);
    }, res);
  } catch (error) {
    response(res, 500, 'Failed to delete user');
  }
};
module.exports = {
  getUser,
  getAllUser,
  createUsers,
  updateUser,
  updateProfile,
  updatePhotoProfile,
  deleteUser,
};
