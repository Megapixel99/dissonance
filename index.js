const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const ios = require('socket.io-express-session');
const {env} = require('./methods');

const app = express();

let server;

if (env.env === 'prod') {
  server = https.createServer({
    cert: fs.readFileSync(path.resolve(__dirname, env.certFullChainPath)),
    key: fs.readFileSync(path.resolve(__dirname, env.certPrivateKeyPath)),
  }, app)
} else {
  server = http.createServer(app);
}

const io = require('socket.io')(server);
const { dbcon, functions,
  session,
 } = require('./methods');

dbcon.connect();

app.set('json spaces', 2);
// app.use(require('helmet')());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

app.use(session);
io.use(ios(session));

app.use(require('./router/client.js'));
app.use('/api/v1', require('./router/api.js'));

app.use('/css', express.static('views/css'));
app.use('/js', express.static('views/js'));
app.use('/vid', express.static('views/vid'));
app.use('/js', express.static('views/js'));
app.use('/img', express.static('views/img'));
app.use('/html', express.static('views/html'));
app.use('/hbs', express.static('views/hbs'));

app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

app.use('/api', (req, res) => {
  res.status(404).json('Page Not found');
});

app.use((req, res) => {
  // res.status(404).sendFile(path.resolve(path.join(__dirname, '/../WebClient/html/404.html')));
});

io.on('connection', (socket) => {
  if (socket.handshake.session.user !== null && socket.handshake.session.user !== undefined) {
    socket.on("message", (data) => {
      if (data.message !== "") {
      functions.channel.post(data.serverId, data.channelId, data.sender, data.message);
      io.to(`${data.serverId}${data.channelId}`).emit("message", {user: socket.handshake.session.user, message: data.message});
      }
      });
      socket.on("server update", (data) => {
        Promise.all([functions.user.get.servers(socket.handshake.session.user.info.id),
        functions.read.user(socket.handshake.session.user.info.id)]).then(function (data) {
        socket.emit("user info", {
          servers: data[0],
          info: data[1]
        });
      });
    });
      Promise.all([functions.user.get.servers(socket.handshake.session.user.info.id),
      functions.read.user(socket.handshake.session.user.info.id)]).then(function (data) {
        let ids = [];
        let connected = [];
        data[0].forEach((i) => {
        i.channels.forEach((e) => ids.push(`${i.id}${e.id}`));
        socket.join(ids);
        });
        console.log(`${socket.handshake.session.user.info.profile.username} connected`);
        io.to(ids).emit("new user connected", {
          id: socket.handshake.session.user.info.id,
          username: socket.handshake.session.user.info.profile.username,
          picture: socket.handshake.session.user.info.profile.picture,
        });
        for (let conn of io.sockets.sockets) {
          if (conn[1].handshake.session.user) {
            connected.push({
              id: conn[1].handshake.session.user.info.id,
              username: conn[1].handshake.session.user.info.profile.username,
              picture: conn[1].handshake.session.user.info.profile.picture,
            });
          }
        }
        socket.emit("user info", {
          servers: data[0],
          info: data[1],
          users: connected,
        });
    });
  socket.on('disconnect', function () {
    Promise.all([functions.user.get.servers(socket.handshake.session.user.info.id),
    functions.read.user(socket.handshake.session.user.info.id)]).then(function (data) {
      let ids = [];
      data[0].forEach((i) => {
      i.channels.forEach((e) => ids.push(`${i.id}${e.id}`));
      socket.leave(ids);
      });
      console.log(`${socket.handshake.session.user.info.profile.username} disconnected`);
      io.to(ids).emit("user disconnected", {
      id: socket.handshake.session.user.info.id,
      username: socket.handshake.session.user.info.profile.username,
      picture: socket.handshake.session.user.info.profile.picture,
    });
   });
});
}
});


server.listen(env.port);
