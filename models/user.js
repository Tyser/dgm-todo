'use strict';

import mongoose, {Schema} from 'mongoose';
import validate from 'mongoose-validator';

// Plugins
import mongoosePassword from '../lib/mongoose-password';
import mongooseCreatedAt from '../lib/mongoose-created-at';
import mongooseUpdatedAt from '../lib/mongoose-updated-at';

let User = new Schema({
  email: {
    type: String,
    required: true,
    validate: [
      validate({
        validator: 'isEmail'
      })
    ]
  }
});

User.plugin(mongoosePassword, {
  path: 'password',
  auth: 'authenticate',
  workFactor: 10
});
User.plugin(mongooseCreatedAt);
User.plugin(mongooseUpdatedAt);

export default mongoose.model('User', User);
