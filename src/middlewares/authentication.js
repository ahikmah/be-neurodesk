const response = require('./../utils/response');
const authToken = require('./authToken');
const { checkToken: m_checkToken } = require('./../models/auth');

exports.checkSecretKey = async (req, res, next) => {
  try {
    if (!req.headers.secret_key) {
      return response(res, 401, 'Unauthorized Access');
    }
    const { SECRET_KEY } = process.env;
    if (req.headers.secret_key === SECRET_KEY) {
      next();
    } else {
      response(res, 401, 'Wrong secret key');
    }
  } catch (error) {
    console.log(error);
    response(res, 401, error.message || 'Unauthorized Access');
  }
};

exports.checkAccessToken = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return response(res, 401, 'Unauthorized Access');
    }
    const bearer = req.headers.authorization.split(' ');
    const token = bearer[1];
    const check = await authToken.verifyToken(token, process.env.ACCESS_SECRET);
    const result = await m_checkToken({ token });
    if (result.data.rowCount > 0) {
      return response(res, 401, 'Expired token');
    }
    req.token = check.data;
    next();
  } catch (error) {
    console.log(error);
    response(res, 401, error.message || 'Unauthorized Access');
  }
};

exports.checkAccessTokenSuperAdmin = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return response(res, 401, 'Unauthorized Access');
    }
    const bearer = req.headers.authorization.split(' ');
    const token = bearer[1];
    const check = await authToken.verifyToken(token, process.env.ACCESS_SECRET);
    const result = await m_checkToken({ token });
    if (result.data.rowCount > 0) {
      return response(res, 401, 'Expired token');
    }
    if (!['01'].includes(check.data.role)) {
      return response(res, 401, 'Unauthorized Access');
    }
    req.token = check.data;
    next();
  } catch (error) {
    console.log(error);
    response(res, 401, error.message || 'Unauthorized Access ...');
  }
};

exports.checkAccessTokenAdmin = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return response(res, 401, 'Unauthorized Access');
    }
    const bearer = req.headers.authorization.split(' ');
    const token = bearer[1];
    const check = await authToken.verifyToken(token, process.env.ACCESS_SECRET);
    const result = await m_checkToken({ token });
    if (result.data.rowCount > 0) {
      return response(res, 401, 'Expired token');
    }
    if (!['01', '02'].includes(check.data.role)) {
      return response(res, 401, 'Unauthorized Access');
    }
    req.token = check.data;
    next();
  } catch (error) {
    console.log(error);
    response(res, 401, error.message || 'Unauthorized Access ...');
  }
};

exports.checkAccessSocketToken = async (socket, next) => {
  try {
    if (!socket.handshake.query) {
      return next(new Error('Unauthorized access'));
    }

    const { token } = socket.handshake.query;
    //   console.log(socket.handshake.query.token);
    if (!token) {
      return next(new Error('Unauthorized access'));
    }
    const bearer = token.split(' ');
    const tokenH = bearer[1];
    const check = await authToken.verifyToken(tokenH, process.env.ACCESS_SECRET);
    const result = await m_checkToken({ tokenH });
    if (result.data.rowCount > 0) {
      return next(new Error('Token Blacklisted'));
    }
    socket.users = check.data;
    next();
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

exports.checkRefreshToken = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return response(res, 401, 'Unauthorized Access ...');
    }
    const bearer = req.headers.authorization.split(' ');
    const token = bearer[1];
    const check = await authToken.verifyToken(token, process.env.REFRESH_SECRET, true);
    const result = await m_checkToken({ token, refresh: true });
    if (result.data.rowCount > 0) {
      return response(res, 401, 'Expired token...');
    }
    req.token = { ...check.data, tokenR: token };
    next();
  } catch (error) {
    console.log(error);
    response(res, 401, error.message || 'Unauthorized Access ...');
  }
};

exports.checkRefreshTokenLogout = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return response(res, 401, 'Unauthorized Access ...');
    }
    const bearer = req.headers.authorization.split(' ');
    const token = bearer[1];
    const check = await authToken.verifyToken(token, process.env.REFRESH_SECRET, true, false);
    const result = await m_checkToken({ token, refresh: true });

    if (result.data.rowCount > 0) {
      req.token = { ...check.data, tokenR: token, logouted: true };
    } else {
      req.token = { ...check.data, tokenR: token };
    }
    next();
  } catch (error) {
    console.log(error);
    response(res, 401, error.message || 'Unauthorized Access ...');
  }
};
