const errs = require('restify-errors');
const log = require('../log');

/*
 * These routes will not expect/require a context/authorization
 */
const authlessRoutes = [
  /\/healthz/,
];

/**
 * Scans the HTTP header for context, and validates/decodes it into
 * req.context which can be accessed by the endpoints.
 *
 * @param {object} req - request
 * @param {object} res - response
 * @param {function} next - middleware continue
 * @return {function|object} result
 */
module.exports = function contextMiddleware(req, res, next) {
  const raw = req.header('x-context');

  if (req.url.match(authlessRoutes)) {
    return next();
  }

  if (!raw) {
    return next(new errs.UnauthorizedError('X-Context header is required to access this service'));
  }

  try {
    const context = JSON.parse(raw);

    if (typeof context !== 'object') {
      return next(new errs.InvalidHeaderError('Invalid context, expecting a json object'));
    }

    // specify the information you need from the context header
    const { id } = context;

    if (!id || typeof id !== 'number') {
      return next(new errs.InvalidHeaderError('Invalid context, expecting id (integer)'));
    }

    req.context = { id };

    log('info', 'User request, context validated', req.context);
  } catch (e) {
    return next(new errs.InvalidHeaderError('Invalid/malformed X-Context header'));
  }

  return next();
};
