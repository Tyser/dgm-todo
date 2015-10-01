'use strict';

import {
  authenticate,
  SessionNotFound
} from '../middleware/auth';

export let route = {

  get: [
    (req, res, next) => {
      if (!req.user) {
        return next(new SessionNotFound('Session not found'));
      }
      res.status(200).json(req.user);
    }
  ],

  post: [
    authenticate(),
    (req, res) => {
      res.status(201).json(req.user);
    }
  ],

  delete: [
    authenticate(),
    (req, res) => {
      req.logout();
      res.status(204);
    }
  ]

};
