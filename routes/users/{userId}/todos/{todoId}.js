'use strict';

import Todo from '../../../../models/todo';
import {authorize} from '../../../../middleware/auth';
import notFound from '../../../../lib/not-found';

let isSelf = authorize(null, (req) => {
  return req.user.id === req.params.userId;
});

export let route = {

  get: [
    isSelf,
    (req, res, next) => {
      Todo
        .findById(req.params.todoId)
        .then(notFound('Todo was not found'))
        .then((todo) => {
          res.status(200).json(todo);
        }, next);
    }
  ],

  put: [
    isSelf,
    (req, res, next) => {
      Todo
        .findByIdAndUpdate(req.params.todoId, req.body, {new: true})
        .then(notFound('Todo was not found'))
        .then((todo) => {
          res.status(200).json(todo);
        }, next);
    }
  ],

  delete: [
    isSelf,
    (req, res, next) => {
      Todo
        .findByIdAndRemove(req.params.todoId)
        .then(notFound('Todo was not found'))
        .then(() => {
          res.sendStatus(204);
        }, next);
    }
  ]

};
