const { pool: db } = require('./../databases/config');
const { insertR, updateR, deleteR } = require('./../utils');

// Create Helper
const createData = (data, tb_name, returnIdx, client) => {
  return new Promise((resolve, reject) => {
    try {
      const qs = insertR(data, tb_name, returnIdx);
      const colValues = Object.keys(data).map(function (key) {
        return data[key];
      });
      if (client) {
        client.query(qs, colValues, (err, result) => {
          if (err) {
            console.log(err);
            return reject({ success: false, error: err });
          }
          resolve({ success: true, data: result });
        });
      } else {
        db.query(qs, colValues, (err, result) => {
          if (err) {
            return reject({ success: false, error: err });
          }
          resolve({ success: true, data: result });
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

// Update Helper
const updateData = (where, data, tb_name, client) => {
  return new Promise((resolve, reject) => {
    try {
      const qs = updateR(where.id, data, tb_name, where.qs, 'updated');
      const colValues = Object.keys(data).map(function (key) {
        return data[key];
      });
      if (client) {
        client.query(qs, colValues, (err, result) => {
          if (err) {
            return reject({ success: false, error: err });
          }
          resolve({ success: true, result });
        });
      } else {
        db.query(qs, colValues, (err, result) => {
          if (err) {
            return reject({ success: false, error: err });
          }
          resolve({ success: true, result });
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

//   Delete Helper
const deleteData = (where, tb_name, client) => {
  return new Promise((resolve, reject) => {
    try {
      const qs = deleteR(where.id, tb_name, where.qs);
      if (client) {
        client.query(qs, (err, result) => {
          if (err) {
            console.log(err);
            return reject({ success: false, error: err });
          }
          resolve({ success: true, result });
        });
      } else {
        db.query(qs, (err, result) => {
          if (err) {
            return reject({ success: false, error: err });
          }
          resolve({ success: true, result });
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createData,
  updateData,
  deleteData,
};
