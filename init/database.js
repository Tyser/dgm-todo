'use strict';

import Promise from 'bluebird';
import mongoose from 'mongoose';

export default (uri, options) => {
  return new Promise((resolve, reject) => {
    mongoose.connect(uri, options);
    mongoose.connection
      .on('error', reject)
      .once('open', resolve);
  });
};
