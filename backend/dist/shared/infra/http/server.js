"use strict";

require("reflect-metadata");

require("dotenv/config");

var _express = _interopRequireDefault(require("express"));

var _cors = _interopRequireDefault(require("cors"));

require("express-async-errors");

var _upload = _interopRequireDefault(require("../../../config/upload"));

var _AppError = _interopRequireDefault(require("../../error/AppError"));

require("../typeorm");

require("../../container");

var _celebrate = require("celebrate");

var _routes = _interopRequireDefault(require("./routes"));

var _rateLimiter = _interopRequireDefault(require("./middlewares/rateLimiter"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const app = (0, _express.default)();
app.use((0, _cors.default)());
app.use(_express.default.json());

_routes.default.use('/files', _express.default.static(_upload.default.uploadsFolder));

app.use(_rateLimiter.default);
app.use(_routes.default);
app.use((0, _celebrate.errors)());
app.use((err, request, response, _) => {
  if (err instanceof _AppError.default) {
    return response.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  console.error(err);
  return response.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});
app.listen(3333, () => {
  console.log('😆 started');
});