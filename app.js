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
import csurf from 'csurf';
import trailblazer from 'trailblazer';
import auth from './middleware/auth';

const SECURE_SESSIONS = config.get('session.secure');
const PORT = config.get('port');
const NAME = config.get('name');
const REDIS = redisUrl.parse(config.get('redis.url'));

let RedisStore = connectRedis(session);
let trailblaze = trailblazer('routes', {
  cwd: __dirname,
  index: true
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
app.use(session({
  cookie: {
    path: '/',
    httpOnly: true,
    secure: SECURE_SESSIONS,
    maxAge: 1 * 24 * 60 * 60 * 1000 // 1 day in milliseconds
  },
  name: `${NAME}.sid`,
  proxy: true,
  saveUninitialized: false,
  resave: false,
  secret: config.get('session.secret'),
  store: new RedisStore({
    host: REDIS.hostname,
    port: REDIS.port,
    ttl: 1 * 24 * 60 * 60, // 1 day in seconds
    db: parseInt(REDIS.database, 10) || 0,
    pass: REDIS.password,
    prefix: `${NAME}:`
  })
}));
app.use(auth());
app.use(csurf());
app.use(urlencoded({extended: true}));
app.use(trailblaze.routes());

mongoose.connect(config.get('mongo.url'));

export default server.start()
  .then(() => console.log(`Server started on port ${PORT}`))
  .catch((err) => console.error('Error starting server:', err.stack));
