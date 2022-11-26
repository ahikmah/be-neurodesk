const Pool = require('pg').Pool;
const { DB_URI } = process.env;
const response = require('./../utils/response');

const pool = new Pool({
  connectionString: DB_URI,
  ssl: {
    rejectUnauthorized: false,
  },
});

const tx = (callback, res) => {
  pool.connect().then(async (client) => {
    try {
      await client.query('BEGIN');
      await callback(client);
      await client.query('COMMIT');
      client.release();
    } catch (err) {
      await client.query('ROLLBACK');
      client.release();
      console.log(err.stack);
      response(res, 500, 'Transaction failed');
    }
  });
};
module.exports = {
  pool,
  tx,
};
