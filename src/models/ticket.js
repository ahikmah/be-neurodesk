const { pool: db } = require('../databases/config');

const getSummary = () => {
  return new Promise((resolve, reject) => {
    try {
      let qs =
        "select (select count(*) from helpdesk.t_tickets where status ='00') as count_open, (select count(*) from helpdesk.t_tickets where status ='01') as count_resolved, (select count(*) from helpdesk.t_tickets where status ='02') as count_closed, (select count(*) from helpdesk.t_tickets where status ='03') as count_duplicate ";

      db.query(qs, (err, result) => {
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
const getAllTicket = (req) => {
  return new Promise((resolve, reject) => {
    try {
      let page = req.query?.page || 1;
      const offset = req.query?.offset || 10;
      page = (page - 1) * offset;

      const params = [];
      let qs =
        "select tt.*, ts.full_name as submitter_name, ts.email as submitter_email, ta.full_name as assignee_name, ta.email asassignee_email, case when tt.status = '01' then 'Resolved' when tt.status = '00' then 'Open' when tt.status = '02' then 'Closed'  when tt.status = '03' then 'Duplicate' else 'Undefined' end as ticket_status, case when tt.priority = '01' then 'High' when tt.priority ='02' then 'Medium' else 'Low' end as ticket_priority, COUNT(*) OVER() as totalCount from helpdesk.t_tickets tt join helpdesk.t_users ts on tt.submitter_id = ts.id join helpdesk.t_users ta on tt.assigned_to_id = ta.id where tt.id is not null ";

      if (req.query?.mine === 'Y') {
        qs = qs + `  and tt.assigned_to_id = $1`;
        params.push(req.token.id_user);
      }
      if (req.query?.myIssue === 'Y') {
        qs = qs + `  and tt.submitter_id = $1`;
        params.push(req.token.id_user);
      }
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
        "select tt.*, ts.full_name as submitter_name, ts.email as submitter_email, ta.full_name as assignee_name, ta.email assignee_email, case when tt.status = '01' then 'Resolved' when tt.status = '00' then 'Open' when tt.status = '02' then 'Closed'  when tt.status = '03' then 'Duplicate' else 'Undefined' end as ticket_status, case when tt.priority = '01' then 'High' when tt.priority ='02' then 'Medium' else 'Low' end as ticket_priority, case when count(tu) = 0 then '[]' else json_agg(jsonb_build_object('name', tu.full_name, 'reply', tr.description, 'attachment', tr.attachment, 'created', tr.created) ORDER BY tr.created DESC) end as replies from helpdesk.t_tickets tt left join helpdesk.t_ticket_log_replies tr on tt.id = tr.id_ticket left join helpdesk.t_users tu on tu.id = tr.submitter_id join helpdesk.t_users ts on ts.id = tt.submitter_id join helpdesk.t_users ta on ta.id = tt.assigned_to_id where tt.id = $1 group by tt.id, ts.id, ta.id ";
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
        "select distinct tu.id, tu.full_name, count(tt.id) from helpdesk.t_users tu left join helpdesk.t_tickets tt on tt.assigned_to_id = tu.id and tt.status = '00' where tu.division =$1 and tu.role in ('02', '01') group by tu.id order by 3 asc limit 1";

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

const getAllCategory = (req) => {
  return new Promise((resolve, reject) => {
    try {
      let page = req.query?.page || 1;
      const offset = req.query?.offset || 10;
      page = (page - 1) * offset;

      const params = [];
      let qs = 'select * from helpdesk.t_master_category';

      qs += ' order by created desc ';
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
  getSummary,
  getAllTicket,
  getTicketDetail,
  getAssignee,
  getAllCategory,
};
