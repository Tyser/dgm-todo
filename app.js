'use strict';

import express from 'express';
import Server from 'hyperbole';
import config from 'config';
import redisUrl from 'redis-url';
import mongoose from 'mongoose';

// Middleware
import cors from 'cors';
import {json, urlencoded} from 'body-parser';
import compression from 'compression';
import session from 'express-session';
import connectRedis from 'connect-redis';
import trailblazer from 'trailblazer';
import auth from './middleware/auth';
import {notFound, errors} from './middleware/errors';
import stripArray from './middleware/strip-array';

const SECURE_SESSIONS = config.get('session.secure');
const PORT = config.get('port');
const NAME = config.get('name');
const SESSION_EXPIRE_SECONDS = 1 * 24 * 60 * 60; // 1 day
const {
  hostname: REDIS_HOST,
  port: REDIS_PORT,
  database: REDIS_DB,
  password: REDIS_PASS
} = redisUrl.parse(config.get('redis.url'));

let RedisStore = connectRedis(session);
let trailblaze = trailblazer('routes', {
  cwd: __dirname
});

export let app = express();
export let server = new Server(app, PORT);

// app settings
app.disable('x-powered-by');
app.set('json spaces', 2);
app.set('trust proxy', SECURE_SESSIONS);

// Middleware initialization
app.use(cors());
app.use(compression());
app.use(json());
app.use(stripArray());
app.use(session({
  cookie: {
    path: '/',
    httpOnly: true,
    secure: SECURE_SESSIONS,
    maxAge: SESSION_EXPIRE_SECONDS * 1000
  },
  name: `${NAME}.sid`,
  proxy: true,
  saveUninitialized: false,
  resave: false,
  secret: config.get('session.secret'),
  store: new RedisStore({
    host: REDIS_HOST,
    port: REDIS_PORT,
    ttl: SESSION_EXPIRE_SECONDS, // 1 day in seconds
    db: parseInt(REDIS_DB, 10) || 0,
    pass: REDIS_PASS,
    prefix: `${NAME}:`
  })
}));
app.use(auth());
app.use(urlencoded({extended: true}));
app.use(trailblaze.routes());
app.use(notFound());
app.use(errors());

mongoose.connect(config.get('mongo.url'));

export default server.start()
  .then(() => console.log(`Server started on port ${PORT}`));
