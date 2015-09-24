'use strict';

require('babel/register');

var app = require('./app');
module.exports = app.default || app;
