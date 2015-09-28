'use strict';

import Promise from 'bluebird';
import bcryptNormal from 'bcrypt';

let bcrypt = Promise.promisifyAll(bcryptNormal);

export default function mongoosePassword(schema, options) {
  options = Object.assign({
    path: 'password',
    auth: 'authenticate',
    workFactor: 10
  }, options);

  schema.path(options.path, String);
  schema.path(options.path).required(true);

  schema.pre('save', function (next) {
    if (!this.isModified(options.path)) { return next(); }
    bcrypt
      .genSaltAsync(options.workFactor)
      .then((salt) => bcrypt.hashAsync(this.get(options.path), salt))
      .then((hash) => {
        this.set(options.path, hash);
      })
      .nodeify(next);
  });

  schema.method(options.auth, function (comparePassword) {
    return bcrypt.compareAsync(comparePassword, this.get(options.path));
  });
}
