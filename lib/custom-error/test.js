'use strict';

import CustomError from './';
import {expect} from 'chai';

describe('lib/custom-error', () => {

  it('should keep the message and status', () => {
    let error = new CustomError('test message', 400);
    expect(error.message).to.be.equal('test message');
    expect(error.status).to.be.equal(400);
    expect(error.name).to.be.equal('CustomError');
  });

  it('should have default status and message', () => {
    let error = new CustomError();
    expect(error.message).to.be.equal('Unexpected Error');
    expect(error.status).to.be.equal(500);
  });

  it('should capture the stack trace', () => {
    let error = new CustomError();
    expect(error.stack).to.contain(__filename);
  });

  it('should be extendable', () => {
    class TestError extends CustomError {
      constructor(message) {
        super(message, 400);
      }
    }
    let error = new TestError('message');
    expect(error.message).to.be.equal('message');
    expect(error.status).to.be.equal(400);
    expect(error.name).to.be.equal('TestError');
  });

});
