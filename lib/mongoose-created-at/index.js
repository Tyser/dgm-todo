'use strict';

export default function createdAt(schema, options) {
  options = Object.assign({
    path: 'createdAt',
    index: false
  }, options);

  schema.path(options.path, Date);
  schema.path(options.path).default(Date.now);

  if (options.index) {
    schema.path(options.path).index(options.index);
  }
}
