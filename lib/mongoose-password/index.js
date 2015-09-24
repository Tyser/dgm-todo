'use strict';

import Promise from 'bluebird';
import bcrypt from 'bcrypt';

bcrypt = Promise.promisifyAll(bcrypt);

export default function mongoosePassword(schema, options) {
  options = Object.assign({
    path: 'password',
    auth: 'authenticate',
    workFactor: 10
  }, options);

  schema.path(options.path, String);
  schema.path(options.path).required(true);

  schema.pre('save', (next) => {
    if (!this.isModified(options.path)) { return next(); }
    bcrypt
      .genSaltAsync(options.workFactor)
      .then((salt) => bcrypt.hashAsync(this.get(options.path), salt))
      .then((hash) => {
        this.set(options.path, hash);
      })
      .nodeify(next);
  });

  schema.method(options.auth, (comparePassword, cb) => {
    return bcrypt
      .compareAsync(comparePassword, this.get(options.path))
      .nodeify(cb);
  });
}
