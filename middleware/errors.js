'use strict';

import {STATUS_CODES} from 'http';
import {NotFoundError} from '../lib/not-found';

export function notFound() {
  return (req, res, next) => {
    next(new NotFoundError(`'${req.path}' is not a valid route`));
  }
}

export function errors() {
  return (err, req, res, next) => {
    err.status = err.status || 500;

    res.status(err.status || 500);

    console.log(err);

    res.json({
      code: err.status,
      error: STATUS_CODES[err.status],
      message: err.message,
      details: err.details
    });
    next();
  };
}
