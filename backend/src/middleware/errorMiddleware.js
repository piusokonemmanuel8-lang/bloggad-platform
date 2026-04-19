function errorHandler(err, req, res, next) {
  const statusCode = err.status || res.statusCode || 500;

  if (res.headersSent) {
    return next(err);
  }

  return res.status(statusCode).json({
    ok: false,
    message: err.message || 'Internal server error',
    error:
      process.env.NODE_ENV === 'production'
        ? undefined
        : {
            message: err.message,
            stack: err.stack,
          },
  });
}

module.exports = {
  errorHandler,
};