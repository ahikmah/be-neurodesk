function updateR(id, cols, tb, where, now) {
  // Setup static beginning of query
  var query = [`UPDATE ${tb}`];
  query.push('SET');

  // Create another array storing each set command
  // and assigning a number value for parameterized query
  var set = [];
  Object.keys(cols).forEach(function (key, i) {
    set.push(key + ' = ($' + (i + 1) + ')');
  });
  if (now) {
    set.push(now + ' = now()');
  }
  query.push(set.join(', '));

  // Add the WHERE statement to look up by id
  if (Array.isArray(id) && Array.isArray(where)) {
    let whereSet = [];
    for (let ix = 0; ix < where.length; ix++) {
      whereSet.push(where[ix] + " = '" + id[ix] + "'");
    }
    query.push('WHERE ');
    query.push(whereSet.join(' AND '));
  } else {
    query.push(`WHERE ${where} = '${id}'`);
  }

  // Return a complete query string
  console.log(query.join(' '));
  return query.join(' ');
}
function insertR(cols, tb, returnIdx) {
  // Setup static beginning of query
  var query = [`INSERT INTO ${tb}(`];
  var inVal = [];
  Object.keys(cols).forEach(function (key, i) {
    inVal.push(key.toString());
  });
  query.push(inVal.join(', '));
  // Create another array storing each set command
  // and assigning a number value for parameterized query
  query.push(') VALUES(');
  var set = [];
  Object.keys(cols).forEach(function (key, i) {
    set.push('$' + (i + 1));
  });
  query.push(set.join(', '));

  // Add the WHERE statement to look up by id
  query.push(`)`);
  if (returnIdx) {
    query.push(' RETURNING ' + returnIdx);
  }

  // Return a complete query string
  return query.join(' ');
}
function deleteR(id, tb, where) {
  // Setup static beginning of query
  var query = [`DELETE FROM ${tb} `];

  // Add the WHERE statement to look up by id
  if (Array.isArray(id) && Array.isArray(where)) {
    let whereSet = [];
    for (let ix = 0; ix < where.length; ix++) {
      whereSet.push(where[ix] + " = '" + id[ix] + "'");
    }
    query.push('WHERE ');
    query.push(whereSet.join(' AND '));
  } else {
    query.push(`WHERE ${where} = '${id}'`);
  }

  // Return a complete query string
  return query.join(' ');
}

const customTanggal = (d) => {
  let date = new Date(d);
  let tahun = date.getFullYear();
  let bulan = date.getMonth();
  let tanggal = date.getDate();

  switch (bulan) {
    case 0:
      bulan = 'Januari';
      break;
    case 1:
      bulan = 'Februari';
      break;
    case 2:
      bulan = 'Maret';
      break;
    case 3:
      bulan = 'April';
      break;
    case 4:
      bulan = 'Mei';
      break;
    case 5:
      bulan = 'Juni';
      break;
    case 6:
      bulan = 'Juli';
      break;
    case 7:
      bulan = 'Agustus';
      break;
    case 8:
      bulan = 'September';
      break;
    case 9:
      bulan = 'Oktober';
      break;
    case 10:
      bulan = 'November';
      break;
    case 11:
      bulan = 'Desember';
      break;
  }

  return tanggal + ' ' + bulan + ' ' + tahun;
};

function stringToSlug(str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;';
  var to = 'aaaaeeeeiiiioooouuuunc------';
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  return str;
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const generateNowPlusTime = (issCreated, min) => {
  const date = new Date(issCreated);
  const jodie = date.getTime() + min * 60000;
  return jodie;
};
const shuffle = (array) => {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
};
const verifDate = (date) => {
  if (date < Date.now()) {
    return false;
  }
  return true;
};
const otpGenerator = () => {
  var digits = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var otpLength = 100;
  var otp = '';
  for (let i = 1; i <= otpLength; i++) {
    var index = Math.floor(Math.random() * digits.length);
    otp = otp + digits[index];
  }
  return otp;
};

module.exports = {
  generateNowPlusTime,
  verifDate,
  insertR,
  updateR,
  deleteR,
  shuffle,
  customTanggal,
  stringToSlug,
  formatBytes,
  otpGenerator,
};
