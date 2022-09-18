module.exports = (response, status = 200, message, success = false, aditionalData = null, countData = null) => {
  let dataRes = {
    code: status,
    success,
    message: success ? message || 'success' : message || 'error request...',
  };
  if (countData) {
    dataRes['totalData'] = countData.total;
    if (countData.total > 0) {
      dataRes['page'] = countData.page || 1;
      const offset = countData.offset || 10;
      dataRes['totalPage'] = Math.ceil(countData.total / offset);
    }
  }
  if (aditionalData) {
    dataRes['data'] = aditionalData;
  }
  return response.status(status).send(dataRes);
};
