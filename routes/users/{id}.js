'use strict';

import User from '../../models/user';
import {authorize} from '../../middleware/auth';
import notFound from '../../lib/not-found';

let isSelf = authorize('admin', (req) => req.user.id === req.params.id);

export let route = {

  get: [
    isSelf,
    (req, res, next) => {
      User
        .findById(req.params.id)
        .then(notFound('User was not found'))
        .then((user) => {
          res.status(200).json(user);
        })
        .catch(next);
    }
  ],

  put: [
    isSelf,
    (req, res, next) => {
      if (req.user.role !== 'admin') {
        delete req.body.role;
      }
      User
        .findByIdAndUpdate(req.params.id, req.body)
        .then(notFound('User was not found'))
        .then((user) => {
          res.status(200).json(user);
        })
        .catch(next);
    }
  ],

  delete: [
    authorize('admin'),
    (req, res, next) => {
      User
        .findByIdAndRemove(req.params.id)
        .then(notFound('User was not found'))
        .then(() => {
          res.sendStatus(204);
        })
        .catch(next);
    }
  ]

};
