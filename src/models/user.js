const { pool: db } = require('./../databases/config');

const getUserInfo = (req) => {
  return new Promise((resolve, reject) => {
    try {
      const params = [];
      let qs =
        "select tu.id, tu.role, tu.photo, tu.full_name, tu.email, tu.status, case when tu.status = '01' then 'Active' when tu.status = '00' then 'Waiting for Activation' else 'Undefined' end as status_user, case when tu.role = '01' then 'Super Admin' when tu.role = '02' then 'Dev Team' when tu.role = '03' then 'Reporter (Ext)' else 'Undefined' end as user_role from helpdesk.t_users tu where tu.id is not null ";

      // Use only one of the query urls below
      // ⚠️ Dont change the order ⚠️
      if (req.query.email) {
        qs += ' and tu.email = $1';
        params.push(req.query.email);
      } else if (req.query.otp) {
        qs += ' and tu.id = $1 and tu.otp = $2';
        params.push(req.query.id);
        params.push(req.query.otp);
      } else if (req.query.id) {
        qs += ' and tu.id = $1';
        params.push(req.query.id);
      } else {
        qs += ' and tu.id = $1';
        params.push(req.token.id_user);
      }
      qs += ' limit 1';

      db.query(qs, params, (err, result) => {
        if (err) {
          console.log(err);
          return reject({ success: false, error: err });
        }
        resolve({ success: true, data: result.rows[0] });
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

const getAllUser = (req) => {
  return new Promise((resolve, reject) => {
    try {
      let page = req.query?.page || 1;
      const offset = req.query?.offset || 10;
      page = (page - 1) * offset;

      const params = [];
      let qs =
        "select tu.id, tu.photo, tu.full_name, tu.email, tu.division, tu.status, case when tu.status = '01' then 'Active' when tu.status = '00' then 'Waiting for Activation' else 'Undefined' end as status_user, case when tu.role = '01' then 'Super Admin' when tu.role = '02' then 'Dev Team' when tu.role = '03' then 'Reporter (Ext)' else 'Undefined' end as user_role, COUNT(*) OVER() as totalCount from helpdesk.t_users tu where tu.id is not null ";

      //Use only one of the query urls below
      if (req.query.email) {
        qs += ' and tu.email = $1';
        params.push(req.query.email);
      } else if (req.query.id) {
        qs += ' and tu.id = $1';
        params.push(req.query.id);
      } else if (req.query.name) {
        qs += " and tu.full_name ilike '%' || $1 || '%'";
        params.push(req.query.name);
      } else if (req.query.role) {
        if (req.query.role === 'ADM') {
          qs += " and (tu.role = '01' or tu.role = '02')";
        } else {
          qs += ' and tu.role = $1';
          params.push(req.query.role);
        }
      }

      qs += ' order by tu.created desc ';
      if (req.query?.page) {
        qs = qs + `  OFFSET ${page} ROWS  FETCH FIRST ${offset} ROW ONLY`;
      }

      db.query(qs, params, (err, result) => {
        if (err) {
          console.log(err);
          return reject({ success: false, error: err });
        }
        resolve({ success: true, data: result });
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

module.exports = {
  getUserInfo,
  getAllUser,
};
