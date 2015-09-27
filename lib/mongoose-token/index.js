'use strict';

import Promise from 'bluebird';
import crypto from 'crypto';

crypto = Promise.promisifyAll(crypto);

module.exports = function createdAt(schema, options) {
  // http://sahatyalkabov.com/how-to-implement-password-reset-in-nodejs/

  // Set the default options
  options = Object.assign({
    tokenPath   : 'token',
    expiresPath : 'tokenExpires',
    setMethod   : 'setToken',
    getByMethod : 'findByToken',
    resetMethod : 'resetToken',
    tokenLength : 20,
    expire      : 1 * 60 * 60 * 1000 // 1 hour
  }, options);

  // Set the path options
  schema.path(options.tokenPath, String);

  schema.path(options.expiresPath, Number);

  // This is the setToken method.
  //
  // It creates a token made from random bytes using the crypto module. Could
  // be convinced to use another module instead
  schema.method(options.setMethod, () => {
    return crypto.randomBytesAsync(options.tokenLength / 2).then((buf) => {
      this.set(options.tokenPath, buf.toString('hex'));
      this.set(options.expiresPath, Date.now() + options.expire);
      return this.save();
    });
  });

  // This is the resetToken method.
  //
  // It resets the tokenPath and expiresPath to undefined, then saves the model.
  schema.method(options.resetMethod, () => {
    this.set(options.tokenPath, undefined);
    this.set(options.expiresPath, undefined);
    // I decided to use the .save method instead of the update method because
    // I found I wanted to use this method in conjuction with updating other
    // properties before this.
    return this.save();
  });

  // This is the getMethod static method.
  //
  // Gets a document by the given token (with additional optional query), as
  // long as the token hasn't expired.
  schema.static(options.getByMethod, (token, query = {}) => {
    query[options.tokenPath] = token;
    query[options.expiresPath] = {$gt: Date.now()};
    return this.findOne(query).exec();
  });

};
