function successResponse(res, data = {}, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    ok: true,
    message,
    ...data,
  });
}

function errorResponse(res, message = 'Something went wrong', statusCode = 500, extra = {}) {
  return res.status(statusCode).json({
    ok: false,
    message,
    ...extra,
  });
}

module.exports = {
  successResponse,
  errorResponse,
};