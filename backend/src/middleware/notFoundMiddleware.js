function notFound(req, res, next) {
  res.status(404);

  const error = new Error(`Route not found: ${req.originalUrl}`);
  next(error);
}

module.exports = {
  notFound,
};