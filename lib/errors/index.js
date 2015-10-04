'use strict';

import CustomError from '../custom-error';

export class NotFoundError extends CustomError {
  constructor(message) { super(message, 404); }
}

export class UnauthorizedError extends CustomError {
  constructor(message) { super(message, 401); }
}

export class ForbiddenError extends CustomError {
  constructor(message) { super(message, 403); }
}
