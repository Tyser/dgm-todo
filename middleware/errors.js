'use strict';

import {STATUS_CODES} from 'http';
import {NotFoundError} from '../lib/errors';

export function notFound() {
  return (req, res, next) => {
    next(new NotFoundError(`'${req.path}' is not a valid route`));
  };
}

export function errors() {
  return (err, req, res, next) => {
    err.status = err.status || 500;

    switch (err.name) {
      case 'AuthenticationError':
        err.status = 401;
        err.message = 'Username or password is incorrect';
        break;
      case 'MongoError':
        switch (err.code) {
          case 11000:
            err.status = 400;
            err.message = 'A record already exists with those identifiers';
            break;
        }
        break;
    }

    res.status(err.status);

    if (err.status >= 500) {
      console.log(err);
    }

    res.json({
      code: err.status,
      error: STATUS_CODES[err.status],
      message: err.message,
      details: err.details
    });
    next();
  };
}
