const { pool: db } = require('../databases/config');

const getAllTicket = (req) => {
  return new Promise((resolve, reject) => {
    try {
      let page = req.query?.page || 1;
      const offset = req.query?.offset || 10;
      page = (page - 1) * offset;

      const params = [];
      let qs =
        "select tt.*, ts.full_name as submitter_name, ts.email as submitter_email, ta.full_name as assignee_name, ta.email asassignee_email, case when tt.status = '01' then 'Resolved' else 'Pending' end as ticket_status, case when tt.priority = '01' then 'High' when tt.priority ='02' then 'Medium' else 'Low' end as ticket_priority, COUNT(*) OVER() as totalCount from helpdesk.t_tickets tt join helpdesk.t_users ts on tt.submitter_id = ts.id join helpdesk.t_users ta on tt.assigned_to_id = ta.id where tt.id is not null ";

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

const getTicketDetail = (req) => {
  return new Promise((resolve, reject) => {
    try {
      let page = req.query?.page || 1;
      const offset = req.query?.offset || 10;
      page = (page - 1) * offset;

      const params = [];
      let qs =
        "select tt.*, ts.full_name as submitter_name, ts.email as submitter_email, ta.full_name as assignee_name, ta.email asassignee_email, case when tt.status = '01' then 'Resolved' else 'Pending' end as ticket_status, case when tt.priority = '01' then 'High' when tt.priority ='02' then 'Medium' else 'Low' end as ticket_priority, json_agg(jsonb_build_object('name', tu.full_name, 'reply', tr.description, 'attachment', tr.attachment, 'created', tr.created) ORDER BY tr.created DESC) as replies from helpdesk.t_tickets tt left join helpdesk.t_ticket_log_replies tr on tt.id = tr.id_ticket join helpdesk.t_users tu on tu.id = tr.submitter_id join helpdesk.t_users ts on ts.id = tt.submitter_id join helpdesk.t_users ta on ta.id = tt.assigned_to_id where tt.id = $1 group by tt.id, ts.id, ta.id ";
      params.push(req.params.id);

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

const getAssignee = (req) => {
  return new Promise((resolve, reject) => {
    try {
      const params = [];
      let qs =
        "select distinct tu.id, tu.full_name, count(tt.id) from helpdesk.t_users tu join helpdesk.t_tickets tt on tt.assigned_to_id = tu.id where tt.status = '00' and tu.division = $1 and tu.role in ('02', '01') group  by tu.id order by 3 ASC limit 1";

      params.push(req.query.division);

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
  getTicketDetail,
  getAssignee,
};
