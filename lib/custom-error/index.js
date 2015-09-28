'use strict';

export default class CustomError extends Error {

  constructor(message = 'Unexpected Error', status = 500) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
    this.status  = status;
    this.name = this.constructor.name;
  }

}
