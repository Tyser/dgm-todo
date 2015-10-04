'use strict';

import CustomError from '../lib/custom-error';

export class InvalidBodyError extends CustomError {
  constructor(message) { super(message, 404); }
}

export default () => {
  return (req, res, next) => {
    if (Array.isArray(req.body)) {
      return next(new InvalidBodyError('Request body must not be an array'));
    }
    next();
  };
};
