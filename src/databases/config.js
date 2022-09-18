const Pool = require('pg').Pool;
const { DB_URI } = process.env;
const response = require('./../utils/response');

const pool = new Pool({
  connectionString: DB_URI,
  ssl: {
    rejectUnauthorized: false,
  },
});

const tx = async (callback, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    try {
      await callback(client);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(error.stack);
      response(res, 500, 'Transaction failed');
    }
  } finally {
    await client.end();
  }
};
module.exports = {
  pool,
  tx,
};
