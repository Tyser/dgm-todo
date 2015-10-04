'use strict';

import {NotFoundError} from '../errors';

export default (message) => {
  return (val) => {
    if (val != null) { return val; }
    throw new NotFoundError(message);
  };
};
