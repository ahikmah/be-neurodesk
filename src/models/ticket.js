const { pool: db } = require('../databases/config');

const getAllTicket = (req) => {
  return new Promise((resolve, reject) => {
    try {
      let page = req.query?.page || 1;
      const offset = req.query?.offset || 10;
      page = (page - 1) * offset;

      const params = [];
      let qs =
        'select tt.*, ts.full_name as submitter_name, ts.email as submitter_email, ta.full_name as assignee_name, ta.email asassignee_email  COUNT(*) OVER() as totalCount from helpdesk.t_tickets tt join helpdesk.t_users ts on tt.submitter_id = ts.id join helpdesk.t_users ta on tt.assigned_to_id = ta.id where tt.id is not null ';

      qs += ' order by tt.created desc ';
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
  getAllTicket,
};
