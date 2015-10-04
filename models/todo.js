'use strict';

import Promise from 'bluebird';
import mongoose, {Schema} from 'mongoose';

const {ObjectId} = Schema.Types;

let TodoSchema = new Schema({
  name: {
    type: String,
    required: true
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
  owner: {
    type: ObjectId,
    required: true,
    ref: 'User'
  }
});



let Todo = mongoose.model('Todo', TodoSchema);
Promise.promisifyAll(Todo);
Promise.promisifyAll(Todo.prototype);

export default Todo;
