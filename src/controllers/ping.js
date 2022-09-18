const response = require('./../utils/response');

const ping = (req, res) => {
  try {
    response(res, 200, 'PONG', true);
  } catch (error) {
    response(res, 400);
  }
};
module.exports = {
  ping,
};
