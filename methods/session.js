const expressSess = require('express-session');
const MongoStore = require('connect-mongo');
const env = require('./env.js');

const { mongoUrl, sessionSecret, httpOnly } = env;

module.exports = expressSess({
  // secret: 'keyboard cat', cookie: { maxAge: 60000 },
  secret: sessionSecret,
  resave: true,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl,
    autoRemove: 'interval',
    ttl: 24 * 60 * 60, // 1 day
    autoRemoveInterval: 24 * 60, // 1 day
  }),
  cookie: {
    path: '/',
    httpOnly,
    secure: httpOnly,
    maxAge: 24 * 60 * 60 * 1000,
  },
});
