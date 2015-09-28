'use strict';

module.exports = function createdAt(schema, options) {
  options = Object.assign({
    attemptsPath  : 'attempts',
    lockUntilPath : 'lockUntil',
    isLockedPath  : 'isLocked',
    incMethod     : 'incAttempts',
    maxAttempts   : 3,
    lockTime      : 1 * 60 * 60 * 1000 // 1 hour
  }, options);

  schema.path(options.lockUntilPath, Number);

  schema.path(options.attemptsPath, Number);
  schema.path(options.attemptsPath)
    .required(true)
    .default(0);

  // Set up the virtual 'isLocked' key
  schema.virtual(options.isLockedPath).get(function () {
    let lockUntil = this.get(options.lockUntilPath);
    return !!(lockUntil && lockUntil > Date.now());
  });

  // Set up the increment method
  schema.method(options.incMethod, function () {
    let now       = Date.now();
    let lockUntil = this.get(options.lockUntilPath);
    let attempts  = this.get(options.attemptsPath);
    let isLocked  = this.get(options.isLockedPath);

    // if we have a previous lock that has expired, restart at 1 attempt
    if (lockUntil && lockUntil < now) {
      this.set({
        [options.attemptsPath]: 1,
        [options.lockUntilPath]: undefined
      });
    }
    // Otherwise, we're incrementing
    else {
      // increment
      this.set(options.attemptsPath, attempts + 1);
      // Lock the account if we've reached max attempts and it's not locked
      if (attempts + 1 >= options.maxAttempts && !isLocked) {
        this.set(options.lockUntilPath, now + options.lockTime);
      }
    }

    return this.save();
  });

};
