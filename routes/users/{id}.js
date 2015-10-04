'use strict';

import User from '../../models/user';
import {authorize} from '../../middleware/auth';
import notFound from '../../lib/not-found';
import {ForbiddenError} from '../../lib/errors';

let isSelf = authorize('admin', (req) => {
  return req.user.id === req.params.id;
});

export let route = {

  get: [
    isSelf,
    (req, res, next) => {
      User
        .findById(req.params.id)
        .then(notFound('User was not found'))
        .then((user) => {
          res.status(200).json(user);
        }, next);
    }
  ],

  put: [
    isSelf,
    (req, res, next) => {
      if (req.user.role !== 'admin' && req.body.role) {
        return next(
          new ForbiddenError('You do not have access to change your role')
        );
      }
      User
        .findByIdAndUpdate(req.params.id, req.body, {new: true})
        .then(notFound('User was not found'))
        .then((user) => {
          res.status(200).json(user);
        }, next);
    }
  ],

  delete: [
    authorize('admin'),
    (req, res, next) => {
      if (req.params.id === req.user.id) {
        return next(
          new ForbiddenError('You cannot delete yourself as a user')
        );
      }
      User
        .findByIdAndRemove(req.params.id)
        .then(notFound('User was not found'))
        .then(() => {
          res.sendStatus(204);
        }, next);
    }
  ]

};
