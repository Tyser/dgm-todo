'use strict';

import path from 'path';
import express from 'express';
import Server from 'hyperbole';
import config from 'config';
import {name as packageName} from './package';

// Middleware
import cors from 'cors';
import {json, urlencoded} from 'body-parser';
import compression from 'compression';
import session from 'express-session';
import connectRedis from 'connect-redis';
import csurf from 'csurf';
import trailblazer from 'trailblazer';

const PORT = config.get('port');

let RedisStore = connectRedis(session);
let trailblaze = trailblazer('routes', {
  cwd: __dirname,
  index: true
});

export let app = express();
export let server = new Server(app, PORT);

app.disable('x-powered-by');
app.set('json spaces', 2);

app.use(cors());
app.use(compression());
app.use(json());
app.use(session({
  cookie: {
    path: '/',
    httpOnly: true,
    secure: false,
    maxAge: 1 * 24 * 60 * 60 * 1000 // 1 day
  },
  name: `${packageName}.sid`,
  proxy: true,
  saveUninitialized: false,
  resave: false,
  secret: config.get('sessionSecret'),
  store: new RedisStore(config.get('redis'))
}));

app.use(urlencoded({extended: true}));
app.use(trailblaze.routes());

export default server.start()
  .then(() => console.log(`Server started on port ${PORT}`))
  .catch((err) => console.error(err.stack));
