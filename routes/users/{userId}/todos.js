'use strict';

import Todo from '../../../models/todo';
import {authorize} from '../../../middleware/auth';

let isSelf = authorize(null, (req) => {
  return req.user.id === req.params.userId;
});

export let route = {

  get: [
    isSelf,
    (req, res, next) => {
      Todo
        .find({owner: req.user.id})
        .then((todos) => {
          res.status(200).json(todos);
        }, next);
    }
  ],

  post: [
    isSelf,
    (req, res, next) => {
      req.body.owner = req.user.id;
      Todo
        .create(req.body)
        .then((todo) => {
          res.status(201).json(todo);
        }, next);
    }
  ]

};
