'use strict';

import CustomError from '../custom-error';

export class NotFoundError extends CustomError {
  constructor(message) { super(message, 404); }
}

export default (message) => {
  return (val) => {
    if (val != null) { return val; }
    throw new NotFoundError(message);
  }
}
