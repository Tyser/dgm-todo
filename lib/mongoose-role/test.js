'use strict';
/* jshint maxlen: false */
/* jshint maxstatements: false */

var expect   = require('chai').expect;
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var role     = require('./');
var testSchema = {
  name: String
};

describe('lib/mongoose-role', function () {

  it('should give accurate user account lockage', function () {
    var TestSchema = new Schema(testSchema);
    TestSchema.plugin(role, {
      roles: ['user', 'admin'],
      accessLevels: {
        'user': ['user', 'admin'],
        'admin': ['admin']
      }
    });
    var Test = mongoose.model('Test1', TestSchema);
    var model1 = new Test({name: 'test1', role: 'user'});
    var model2 = new Test({name: 'test2', role: 'admin'});
    expect(model1.hasAccess('user')).to.be.equal(true);
    expect(model1.hasAccess('admin')).to.be.equal(false);
    expect(model2.hasAccess('user')).to.be.equal(true);
    expect(model2.hasAccess('admin')).to.be.equal(true);
    expect(model1.hasAccess()).to.be.equal(true);
    expect(model1.hasAccess('public')).to.be.equal(false);
  });

  it('should not break completely if options aren\'t passed', function () {
    var TestSchema = new Schema(testSchema);
    TestSchema.plugin(role);
    var Test = mongoose.model('Test2', TestSchema);
    var model1 = new Test({name: 'test1', role: 'user'});
    var model2 = new Test({name: 'test2', role: 'admin'});
    expect(model1.hasAccess('user')).to.be.equal(false);
    expect(model1.hasAccess('admin')).to.be.equal(false);
    expect(model2.hasAccess('user')).to.be.equal(false);
    expect(model2.hasAccess('admin')).to.be.equal(false);
    expect(model1.hasAccess()).to.be.equal(true);
    expect(model1.hasAccess('public')).to.be.equal(false);
    return expect(model1.save()).to.eventually.be.rejected;
  });

});
