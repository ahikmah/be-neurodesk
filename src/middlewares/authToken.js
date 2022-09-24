const dateGen = require('./../utils');
const jgCrypt = require('./../utils/crypto');
const { logoutToken: m_logoutToken } = require('./../models/auth');

const generateToken = async (data, expires, secret) => {
  try {
    const now = Date.now();
    const cryptID = await jgCrypt.encrypt(`${secret}|${data.id}|${data.role}|${now}|${dateGen.generateNowPlusTime(now, expires)}`);
    return cryptID;
  } catch (error) {
    return error;
  }
};

const verifyToken = (data, secret, lgout = false, exp = false) => {
  return new Promise(async (resolve, reject) => {
    const cryptData = await jgCrypt.decrypt(data);
    const token = cryptData.split('|');
    const validateDate = dateGen.verifDate(token[4]);
    if (!validateDate) {
      if (lgout) {
        const resultLgOut = await m_logoutToken({ rToken: data });
        if (resultLgOut.data.rowCount > 0) {
          console.log('logout if token is expired');
        }
      }
      if (exp) {
        reject(new Error('Expired token'));
      }
    } else if (token[0] !== secret) {
      reject(new Error('Wrong secret token'));
    }
    resolve({ message: 'Token verified', data: { id_user: token[1], role: token[2] } });
  });
};
module.exports = {
  generateToken,
  verifyToken,
};
