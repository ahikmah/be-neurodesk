const { pool: db } = require('./../databases/config');

const login = (data) => {
  return new Promise((resolve, reject) => {
    try {
      db.query('select tu.id, tu.email,  tu.password from helpdesk.t_users tu where tu.email = $1', [data.email], (err, result) => {
        if (err) {
          reject({ success: false, error: err });
        }
        resolve({ success: true, data: result });
      });
    } catch (error) {
      reject(error);
    }
  });
};

const revokeToken = (data, login) => {
  return new Promise((resolve, reject) => {
    try {
      db.query(
        'INSERT INTO helpdesk.t_user_auth_log(id_user,access_token,refresh_token,is_active,flag_statement) VALUES($1,$2,$3,true,$4)',
        [data.id_user, data.accessToken, data.refreshToken, login ? '01' : '00'],
        (err, result) => {
          if (err) {
            console.log(err);
            reject({ success: false, error: err });
          }
          resolve({ success: true, result });
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

const logoutToken = (data, logout) => {
  return new Promise((resolve, reject) => {
    try {
      db.query(
        `UPDATE helpdesk.t_user_auth_log set is_active = false, updated = now() ${logout ? ", flag_statement = '11' " : ''} where refresh_token = $1`,
        [data.rToken],
        (err, result) => {
          if (err) {
            reject({ success: false, error: err });
          }
          resolve({ success: true, data: result });
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

const checkToken = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const qs = data?.refresh
        ? 'select refresh_token from helpdesk.t_user_auth_log where refresh_token = $1 and is_active = false'
        : 'select refresh_token from helpdesk.t_user_auth_log where access_token = $1 and is_active = false';

      db.query(qs, [data.token], (err, result) => {
        if (err) {
          reject({ success: false, error: err });
        }
        resolve({ success: true, data: result });
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getPassword = (req) => {
  return new Promise((resolve, reject) => {
    try {
      db.query('select tu.id, tu.email, tu.password from helpdesk.t_users tu where tu.id = $1', [req.token.user_id], (err, result) => {
        if (err) {
          reject({ success: false, error: err });
        }
        resolve({ success: true, data: result.rows[0] });
      });
    } catch (error) {
      reject(error);
    }
  });
};
module.exports = {
  login,
  checkToken,
  revokeToken,
  logoutToken,
  getPassword,
};
