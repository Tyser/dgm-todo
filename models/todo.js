'use strict';

import Promise from 'bluebird';
import mongoose, {Schema} from 'mongoose';

import mongooseCreatedAt from '../lib/mongoose-created-at';
import mongooseUpdatedAt from '../lib/mongoose-updated-at';

const {ObjectId} = Schema.Types;

let TodoSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  tags: {
    type: [String],
    index: true
  },
  completed: {
    type: Boolean,
    default: false,
    index: true
  },
  archived: {
    type: Boolean,
    default: false,
    index: true
  },
  priority: {
    type: Number
  },
  order: {
    type: Number,
    default: 0
  },
  dueDate: {
    type: Date
  },
  owner: {
    type: ObjectId,
    required: true,
    ref: 'User'
  }
});

TodoSchema.plugin(mongooseCreatedAt, {
  path: 'createdAt'
});
TodoSchema.plugin(mongooseUpdatedAt, {
  path: 'updatedAt'
});


const PUBLIC_FIELDS = [
  'id',
  'name',
  'description',
  'tags',
  'completed',
  'archived',
  'order',
  'dueDate',
  'owner'
];
TodoSchema.method('toJSON', function () {
  let obj = this.toObject();
  obj.id = obj._id;
  return PUBLIC_FIELDS.reduce((todo, field) => {
    todo[field] = obj[field];
    return todo;
  }, {});
});


let Todo = mongoose.model('Todo', TodoSchema);
Promise.promisifyAll(Todo);
Promise.promisifyAll(Todo.prototype);

export default Todo;
