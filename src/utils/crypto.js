const srand = require('seedrandom');
const crypto = require('crypto');
const key = '13aRa@2791001';

exports.encrypt = async (t) => {
  try {
    srand(((Date.now() % 1000) / 1000) * 1000000, { global: true });
    const randomm = Math.floor(Math.random() * (32000 - 0 + 1) + 0);
    const r = crypto.createHash('sha256').update(randomm.toString()).digest('hex');
    // console.log(r)
    let c = 0;
    let v = '';
    for (let i = 0; i < t.length; i++) {
      if (c == r.length) {
        c = 0;
      }
      v += r.substr(c, 1) + String.fromCharCode(t.substr(i, 1).charCodeAt(0) ^ r.substr(c, 1).charCodeAt(0));
      c++;
    }
    return Buffer.from(ed(v)).toString('base64').replace(/\//g, '2SN2u3ns2329sos102831n2i');
  } catch (error) {
    return error;
  }
};

exports.decrypt = async (t) => {
  try {
    const a = await t.replace(/2SN2u3ns2329sos102831n2i/g, '/');
    const c = Buffer.from(a, 'base64').toString('ascii');
    const b = ed(c);
    let v = '';
    for (let i = 0; i < t.length; i++) {
      const md5 = b.substr(i, 1);
      i++;
      v += String.fromCharCode(b.substr(i, 1).charCodeAt(0) ^ md5.charCodeAt(0));
    }
    return v.replace(/[^a-zA-Z0-9!@#$%^&*():|{};+-_=?/",.~ ]/g, '');
  } catch (error) {
    return error;
  }
};

function ed(t) {
  const r = crypto.createHash('sha256').update(key).digest('hex');
  let c = 0;
  let v = '';
  for (let i = 0; i < t.length; i++) {
    if (c == r.length) {
      c = 0;
    }
    const aa = t.substr(i, 1);
    const bb = r.substr(c, 1);
    v += String.fromCharCode(aa.charCodeAt(0) ^ bb.charCodeAt(0));
    c++;
  }

  return v;
}
