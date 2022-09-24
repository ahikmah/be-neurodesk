const { tx } = require('./../databases/config');

const axios = require('axios');
const bcrypt = require('bcrypt');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');

const util = require('./../utils/');
const { transporter } = require('./../utils/transporter');
const response = require('./../utils/response');

const authToken = require('./../middlewares/authToken');
const authModel = require('./../models/auth');
// const userModel = require('./../models/user');
const { createData, updateData, deleteData } = require('./../utils/crud');
const { REACT_APP, BE_ILS, EXT_SECRET } = process.env;

const register = async (req, res) => {
  try {
    tx(async (client) => {
      const data_register = req.body;
      data_register.otp = util.otpGenerator();
      const salt = await bcrypt.genSalt(13);
      data_register.password = await bcrypt.hash(data_register.password, salt);
      data_register.role = '01';
      const createAccount = await createData(data_register, 'helpdesk.t_users', 'id', client);

      if (createAccount.success) {
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
          to: req.body.email,
          subject: 'Account Activation',
          template: 'activation-sa', // the name of the template file i.e email.handlebars
          context: {
            name: data_register.full_name,
            link: `${REACT_APP}/activation?otp=${data_register.otp}&id=${createAccount.data.rows[0].id}`,
          },
        };

        // trigger the sending of the E-mail
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            return console.log(error);
          }
          console.log('Message sent: ' + info.response);
        });

        return response(res, 201, 'Registration Success', createAccount.success);
      } else {
        return response(res, 500, 'Registration Failed');
      }
    }, res);
  } catch (error) {
    console.log(error);
    response(res, 500, 'Registration Failed');
  }
};

const accountActivation = async (req, res) => {
  try {
    tx(async (client) => {
      const { body } = req;
      body.otp = null;
      body.status = '01';
      const whereUpdate = { id: body.id, qs: 'id' };
      await updateData(whereUpdate, body, 'helpdesk.t_users', client);

      const dataLog = {
        id_user: body.id,
        activity: `Activate Account`,
        action: 'update',
        req_query: JSON.stringify(req.query),
        req_params: JSON.stringify(req.params),
        req_body: null,
      };

      await createData(dataLog, 'helpdesk.t_user_log_activities', 'id', client);
      const accessToken = await authToken.generateToken({ id: body.id, role: req.query.role }, 1440, process.env.ACCESS_SECRET);
      const refreshToken = await authToken.generateToken({ id: body.id, role: req.query.role }, 2880, process.env.REFRESH_SECRET);
      const result = await authModel.revokeToken(
        {
          accessToken,
          refreshToken,
          id_user: body.id,
          role: req.query.role,
        },
        true
      );
      if (!result.success) {
        return response(res, 500, 'Failed to activate account');
      }
      response(res, 200, 'Activation Success', true, { accessToken, refreshToken });
    }, res);
  } catch (error) {
    console.log(error);
    response(res, 500, 'Failed to activate account');
  }
};

const login = async (req, res) => {
  try {
    const data = req.body;
    const dataRow = await authModel.login(data);
    if (!dataRow || dataRow.data.rowCount === 0) {
      return response(res, 401, 'Email/Password is wrong');
    }
    const checkPass = await bcrypt.compare(data.password, dataRow.data.rows[0].password);
    if (!checkPass) {
      return response(res, 401, 'Email/Password is wrong');
    }
    const accessToken = await authToken.generateToken(
      { id: dataRow.data.rows[0].id, role: dataRow.data.rows[0].role },
      1440,
      process.env.ACCESS_SECRET
    );
    const refreshToken = await authToken.generateToken(
      { id: dataRow.data.rows[0].id, role: dataRow.data.rows[0].role },
      2880,
      process.env.REFRESH_SECRET
    );
    const result = await authModel.revokeToken(
      {
        accessToken,
        refreshToken,
        id_user: dataRow.data.rows[0].id,
        role: dataRow.data.rows[0].role,
      },
      true
    );
    if (!result.success) {
      return response(res, 500, 'Login Failed');
    }
    response(res, 201, 'Login success', true, { accessToken, refreshToken });
  } catch (error) {
    console.log(error);
    response(res, 500, 'Login Failed');
  }
};

const sendEmailResetPassword = async (req, res) => {
  try {
    const otp = util.otpGenerator();
    const whereUpdate = { id: req.query.id, qs: 'id' };
    await updateData(whereUpdate, { otp: otp }, 'helpdesk.t_users');
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
      to: req.body.email,
      subject: 'Password reset request',
      template: 'resetPassword', // the name of the template file i.e email.handlebars
      context: {
        name: req.query.full_name,
        link: `${REACT_APP}/reset-password?otp=${otp}&id=${req.query.id}`,
      },
    };

    // trigger the sending of the E-mail
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: ' + info.response);
    });

    response(res, 200, 'Successfully send email', true);
  } catch (error) {
    console.log(error);
    response(res, 500, 'Failed to send email');
  }
};

const changePassword = async (req, res) => {
  try {
    tx(async (client) => {
      const { body } = req;
      const salt = await bcrypt.genSalt(13);
      body.password = await bcrypt.hash(body.password, salt);

      const getPassword = await authModel.getPassword(req);

      const checkPass = await bcrypt.compare(body.oldPassword, getPassword.data.password);
      if (!checkPass) {
        return response(res, 401, 'Old Password is wrong');
      }
      const whereUpdate = { id: req.token.user_id, qs: 'id' };
      await updateData(whereUpdate, { password: body.password }, 'helpdesk.t_users', client);

      const dataLog = {
        id_user: req.token.user_id,
        activity: `Change password`,
        action: 'update',
        req_query: JSON.stringify(req.query),
        req_params: JSON.stringify(req.params),
        req_body: null,
      };

      await createData(dataLog, 'helpdesk.t_user_log_activities', 'id', client);

      response(res, 200, 'Password successfully changed', true);
    }, res);
  } catch (error) {
    console.log(error);
    response(res, 500, 'Failed to change Password');
  }
};

const setPassword = async (req, res) => {
  try {
    tx(async (client) => {
      const { body } = req;
      const salt = await bcrypt.genSalt(13);
      body.password = await bcrypt.hash(body.password, salt);
      body.otp = null;
      body.status = '01';
      const whereUpdate = { id: body.id, qs: 'id' };
      await updateData(whereUpdate, body, 'helpdesk.t_users', client);

      const dataLog = {
        id_user: body.id,
        activity: `Setting a password`,
        action: 'update',
        req_query: JSON.stringify(req.query),
        req_params: JSON.stringify(req.params),
        req_body: null,
      };

      await createData(dataLog, 'helpdesk.t_user_log_activities', 'id', client);

      const accessToken = await authToken.generateToken(
        { id: body.id, role: req.query.role, library: req.query.id_library },
        1440,
        process.env.ACCESS_SECRET
      );
      const refreshToken = await authToken.generateToken(
        { id: body.id, role: req.query.role, library: req.query.id_library },
        2880,
        process.env.REFRESH_SECRET
      );
      const result = await authModel.revokeToken(
        {
          accessToken,
          refreshToken,
          id_user: body.id,
          role: req.query.role,
          library: req.query.id_library,
        },
        true
      );
      if (!result.success) {
        return response(res, 500, 'Failed to activate account and set password');
      }
      response(res, 200, 'Password successfully saved', true, { accessToken, refreshToken });
    }, res);
  } catch (error) {
    console.log(error);
    response(res, 500, 'Failed to set password');
  }
};

const revokeToken = async ({ token }, res) => {
  try {
    const lgTK = await authModel.logoutToken({ rToken: token.tokenR });
    if (!lgTK.success) {
      return response(res, 400, 'Revoke Failed');
    }
    const accessToken = await authToken.generateToken({ id: token.id, role: token.role, library: token.id_library }, 2, process.env.ACCESS_SECRET);
    const refreshToken = await authToken.generateToken(
      { id: token.id, role: token.role, library: token.id_library },
      240,
      process.env.REFRESH_SECRET
    );
    const result = await authModel.revokeToken({ accessToken, refreshToken, id_auth: token.id_auth });
    if (!result.success) {
      return response(res, 400, 'Revoke Failed');
    }
    response(res, 200, 'Revoke success', true, { accessToken, refreshToken });
  } catch (error) {
    console.log(error);
    response(res, 400, 'Revoke Failed');
  }
};

const logoutToken = async ({ token }, res) => {
  try {
    if (!token.logouted) {
      const result = await authModel.logoutToken({ rToken: token.tokenR }, true);
      if (!result.success) {
        return response(res, 400, 'Logout Failed');
      }
    }
    response(res, 201, 'Logout success', true);
  } catch (error) {
    console.log(error);
    response(res, 400, 'Logout Failed');
  }
};

module.exports = {
  register,
  accountActivation,
  login,
  sendEmailResetPassword,
  setPassword,
  changePassword,
  logoutToken,
  revokeToken,
};
