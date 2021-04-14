const router = require('express').Router();
const moment = require('moment');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const {
  ajv, env, functions, upload,
} = require('../methods');

handlebars.registerHelper('formatDate', (dateString) => new handlebars.SafeString(
  moment(dateString).tz(process.env.TIMEZONE).format('dddd, MMMM Do YYYY, h:mm:ss a'),
));
handlebars.registerHelper('decToPrecent', (decString) => new handlebars.SafeString(
  `${Number((decString * 100).toFixed(2))}%`,
));
handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
  return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
});
handlebars.registerHelper('ifBoth', function (arg1, arg2, options) {
  return (arg1 && arg2) ? options.fn(this) : options.inverse(this);
});
handlebars.registerHelper('ifEither', function (arg1, arg2, options) {
  return (arg1 || arg2) ? options.fn(this) : options.inverse(this);
});
handlebars.registerHelper('nameAbriviation', function (_name) {
  let name = '';
  _name.split(' ').forEach((i) => {name += i[0]});
  return name;
});
handlebars.registerHelper({
  eq: (v1, v2) => v1 === v2,
  ne: (v1, v2) => v1 !== v2,
  lt: (v1, v2) => v1 < v2,
  gt: (v1, v2) => v1 > v2,
  lte: (v1, v2) => v1 <= v2,
  gte: (v1, v2) => v1 >= v2,
  and() {
    return Array.prototype.every.call(arguments, Boolean);
  },
  or() {
    return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
  },
});

router.get('/', async (req, res) => {
  res.redirect(301, '/login');
});

router.get('/login', async (req, res) => {
  if (req.session.user) {
    if (req.query.redirect) {
      res.redirect(301, req.query.redirect);
    } else {
      res.redirect(301, '/channels/@me');
    }
  } else {
    const template = handlebars.compile(fs.readFileSync(path.resolve('views/hbs/login.hbs')).toString());
    res.send(template({
      redirect: (req.query.redirect ? req.query.redirect : '/channels/@me'),
    }));
  }
});

router.get('/register', (req, res) => {
  if (req.session.user) {
    if (req.query.redirect) {
      res.redirect(301, req.query.redirect);
    } else {
      res.redirect(301, '/channels/@me');
    }
  } else {
    const template = handlebars.compile(fs.readFileSync(path.resolve('views/hbs/register.hbs')).toString());
    res.send(template({
      redirect: (req.query.redirect ? req.query.redirect : '/channels/@me'),
    }));
  }
});

router.post('/login', async (req, res) => {
  if (req.session.user) {
    if (req.query.redirect) {
      res.redirect(301, req.query.redirect);
    } else {
      res.redirect(301, '/channels/@me');
    }
  } else {
    // const validation = ajv.validatelogin(req.body);
    // if (validation === null) {
      functions.user.login(req.body.email, req.body.password).then((user) => {
        if (user) {
          functions.user.get.servers(user.id).then((servers) => {
            req.session.user = {
              info: user,
              servers,
            };
            res.sendStatus(200);
          }).catch((err) => {
            res.sendStatus(500);
            console.error(err);
          });
        } else {
          res.sendStatus(401);
        }
      }).catch((err) => {
        res.sendStatus(500);
        console.error(err);
      });
    // } else {
    //   res.status(403).send({ status: 403, message: 'Invalid request body', reason: validation });
    // }
  }
});

router.post('/register', (req, res) => {
  if (req.session.user) {
    if (req.query.redirect) {
      res.redirect(301, req.query.redirect);
    } else {
      res.redirect(301, '/channels/@me');
    }
  } else {
    // const validation = ajv.validateregistration(req.body);
    // if (validation === null) {
      functions.create.user(req.body.username, req.body.password, req.body.email, (req.headers['x-forwarded-for'] || req.connection.remoteAddress)).then((user) => {
        req.session.user = {
          info: user,
          servers: [],
        };
        res.sendStatus(201);
      }).catch((err) => {
        res.sendStatus(500);
        console.error(err);
      });
    // } else {
    //   res.status(403).send({ status: 403, message: 'Invalid request body', reason: validation });
    // }
  }
});

router.post('/create/server', upload.single('photo'), (req, res) => {
  if (req.session.user) {
    const imagePath = null;
    // if (req.file !== null && req.file !== undefined && req.file.mimetype.includes('image')) {
    //   imagePath = path.join('/img/', data.uuid) + path.extname(req.file.originalname);
    // }
    functions.create.server(req.body.name, imagePath, req.session.user).then((server) => {
      req.session.user.servers.push(server);
      res.status(201).json(server);
    }).catch((err) => {
      res.sendStatus(500);
      console.error(err);
    });
  } else {
    res.sendStatus(401);
  }
});

router.get('/channels/:server', async (req, res) => {
  if (req.session.user) {
    if (req.params.server === '@me') {
      const template = handlebars.compile(fs.readFileSync(path.resolve('views/hbs/base.hbs')).toString());
      res.send(template({
        servers: req.session.user.servers,
        channels: [],
        messages: [],
        serverId: req.params.server,
        channelId: req.params.channel,
      }));
    } else {
      const server = (await functions.read.server(req.params.server));
      res.redirect(`/channels/${req.params.server}/${server.channels[0].id}`);
    }
  } else {
    res.redirect(`/login?redirect=/channels/${req.params.server}`);
  }
});

router.get('/channels/:server/:channel', async (req, res) => {
  if (req.session.user) {
    const template = handlebars.compile(fs.readFileSync(path.resolve('views/hbs/base.hbs')).toString());
    console.log(req.session.user.servers);
    const server = req.session.user.servers.find((e) => e.id === Number(req.params.server));
    res.send(template({
      servers: req.session.user.servers,
      serverName: server.name,
      users: (await functions.server.getUsers(server.users)),
      channels: server.channels,
      messages: server.channels.find((e) => e.id === Number(req.params.channel)).messages,
      serverId: req.params.server,
      channelId: req.params.channel,
    }));
  } else {
    res.redirect(`/login?redirect=/channels/${req.params.server}/${req.params.channel}`);
  }
});

router.get('/channels/:server/:channel/messages', async (req, res) => {
  if (req.session.user) {
    const channel = (await functions.read.channel(req.params.server, req.params.channel));
    if (channel) {
      for (let i = 0; i < channel.messages.length; i += 1) {
        const info = (await functions.read.user(channel.messages[i].sender));
        if (info) {
          channel.messages[i].username = info.profile.username;
          channel.messages[i].picture = info.profile.picture;
        } else {
          channel.messages[i].username = '[ deleted user ]';
          channel.messages[i].picture = '/img/avatars/deleted.png';
        }
      }
      res.send(channel.messages);
    } else {
      res.send([]);
    }
  } else {
    res.sendStatus(401);
  }
});

router.get('/server/:server', async (req, res) => {
  if (req.session.user) {
    functions.read.server(req.params.server).then((server) => {
      functions.server.getUsers(server.users).then((users) => {
        res.send({
          server,
          users,
        });
      }).catch((err) => {
        res.sendStatus(500);
        console.error(err);
      });
    }).catch((err) => {
      res.sendStatus(500);
      console.error(err);
    });
  } else {
    res.sendStatus(401);
  }
});

router.post('/create/invite/:server/:channel', async (req, res) => {
  if (req.session.user) {
    functions.create.invite(req.params.server, req.params.channel).then((invite) => {
      if (env.httpOnly) {
        res.status(201).send(`https://${req.hostname}/join/${invite.id}`);
      } else {
        res.status(201).send(`http://${req.hostname}/join/${invite.id}`);
      }
    }).catch((err) => {
      res.sendStatus(500);
      console.error(err);
    });
  } else {
    res.sendStatus(401);
  }
});

router.get('/join/:inviteCode', async (req, res) => {
  if (req.session.user) {
    functions.read.invite(req.params.inviteCode).then((invite) => {
      functions.user.join.server(req.session.user.info.id, invite.server.id).then((info) => {
        console.log(info);
        if (info.joined) {
          req.session.user.servers.push(info.server);
        }
        res.redirect(301, `/channels/${invite.server.id}/${invite.server.channel.id}`);
      }).catch((err) => {
        res.sendStatus(500);
        console.error(err);
      });
    }).catch((err) => {
      res.sendStatus(500);
      console.error(err);
    });
  } else {
    res.redirect(`/login?redirect=/join/${req.params.inviteCode}`);
  }
});

router.get('/favicon.ico', async (req, res) => {
  res.sendFile(path.resolve(__dirname, '../views/img/favicon.ico'));
});

module.exports = router;
