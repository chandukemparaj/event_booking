
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Server Error';

  
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  
  if (err.code === 11000) {
    statusCode = 400;
    message = `Duplicate value entered for field: ${Object.keys(err.keyValue)}`;
  }

  
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = errorHandler;
