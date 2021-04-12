const { nanoid } = require('nanoid');
const { models, uuid, bcrypt } = require('.');

module.exports = {
  create: {
    async server(name, picture = null, user = null) {
      let id = Number(uuid());
      server = await models.server.findOne({ id });
      do {
        id = Number(uuid());
      } while (server !== null);
      return (new models.server({
        id,
        name,
        picture,
        users: (user !== null ? [{ id: user.id, nickname: null }] : []),
        channels: [{
          name: 'general',
          id: Number(`${uuid()}${uuid()}`),
          messages: [],
        }, {
          name: 'random',
          id: Number(`${uuid()}${uuid()}`),
          messages: [],
        }],
      }).save());
    },
    async invite(serverId, channelId, uses = null, until = null) {
      const id = nanoid(8);
      return (new models.invite({
        id,
        server: {
          id: serverId,
          channel: {
            id: channelId,
          },
        },
        active: {
          uses,
          until,
        },
      }).save());
    },
    async channel(serverId, channelName) {
      let id = Number(`${uuid()}${uuid()}`);
      channel = await models.server.findOne({ id: serverId, 'channel.id': id });
      do {
        id = Number(`${uuid()}${uuid()}`);
      } while (channel !== null);
      return (models.server.findOneAndUpdate({ id: serverId }, {
        channels: {
          $push: {
            name: channelName,
            id,
            messages: [],
          },
        },
      }, { new: true }));
    },
    async user(username, password, email, ip, picture = `/img/avatars/default${Math.floor(Math.random() * 10)}.png`, status = null) {
      let id = Number(`${uuid()}${uuid()}`);
      user = await models.user.findOne({ id });
      do {
        id = Number(`${uuid()}${uuid()}`);
      } while (user !== null);
      return (new models.user({
        id,
        ip: [ip], // push to this array during login if you want to warn about new devices
        password: bcrypt.generate(password),
        email,
        profile: {
          username,
          picture,
          status,
        },
      }).save());
    },
  },
  read: {
    server(id) {
      return (models.server.findOne({ id }).lean());
    },
    invite(id) {
      return (models.invite.findOne({ id }).lean());
    },
    channel(serverId, channelId) {
      return (new Promise(async (resolve) => {
        resolve((await models.server.findOne({ id: serverId }).lean()).channels.find((e) => e.id === Number(channelId)));
      }));
    },
    message(serverId, channelId, messageId) {
      return (new Promise(async (resolve) => {
        resolve((await models.server.findOne({ id: serverId }).lean()).channels.find((e) => e.id === Number(channelId)).messages.find((e) => e.id === Number(messageId)));
      }));
    },
    user(id) {
      return (new Promise(async (resolve) => {
        const user = (await models.user.findOne({ id: Number(id) }));
        if (user) {
          delete user.password;
        }
        resolve(user);
      }));
    },
  },
  update: {
    server(id, data) {
      return (models.server.findOneAndUpdate({ id }, data, { new: true }));
    },
    channel(serverId, channelId, data) {
      return (models.server.findOneAndUpdate({ id: serverId, 'channels.id': channelId }, {
        $set: {
          'channels.$': data,
        },
      }, { new: true }));
    },
    channel(serverId, channelId, messageId, data) {
      return (models.server.findOneAndUpdate({ id: serverId, 'channels.id': channelId, 'messages.id': messageId }, {
        $set: {
          'messages.$': data,
        },
      }, { new: true }));
    },
    user(id, data) {
      return (models.user.findOneAndUpdate({ id }, data, { new: true }));
    },
  },
  delete: {
    server(id) {
      return (models.server.findOneAndDelete({ id }));
    },
    invite(id) {
      return (models.invite.findOneAndDelete({ id }));
    },
    channel(serverId, channelId) {
      return (models.server.findOneAndUpdate({ id: serverId }, { $pull: { channels: { id: channelId } } }));
    },
    message(serverId, channelId, messageId) {
      return (models.server.findOneAndUpdate({ id: serverId, channels: { id: channelId } }, { $pull: { messages: { id: messageId } } }));
    },
    user(id) {
      return (models.user.findOneAndDelete({ id }));
    },
  },
  channel: {
    post(serverId, channelId, sender, message) {
      return (models.server.findOneAndUpdate({ id: serverId, 'channels.id': channelId }, {
        $push: {
          'channels.$.messages': {
            id: Number(`${uuid()}${uuid()}`),
            sent: new Date(Date.now()),
            sender,
            message,
          },
        },
      }, { new: true }).exec());
    },
  },
  user: {
    login(email, password) {
      return (new Promise((resolve, reject) => {
        models.user.findOne({ email }).then((user, err) => {
          if (err) {
            reject(err);
          } else if (user) {
            if (bcrypt.compare(password, user.password)) {
            // compare ip here if you want
              delete user.password;
              resolve(user);
            } else {
              resolve();
            }
          } else {
            resolve();
          }
        });
      }));
    },
    get: {
      async servers(userID) {
        return (await models.server.find({ 'users.id': userID }).lean());
      },
    },
    join: {
      server(userID, serverId) {
        return new Promise((resolve, reject) => {
          models.server.findOne({ id: Number(serverId) }).then((server) => {
            if (server.users.some((e) => e.id === userID)) {
              resolve({
                server,
                joined: false,
              });
            } else {
              models.server.findOneAndUpdate({ id: Number(serverId) }, {
                $push: {
                  users: {
                    id: userID,
                    nickname: null,
                  },
                },
              }, { new: true }, (err, updatedServer) => {
                if (err) {
                  reject(err);
                } else {
                  resolve({
                    server: updatedServer,
                    joined: true,
                  });
                }
              });
            }
          });
        });
      },
    },
  },
  server: {
    getUsers(users) {
      return (new Promise((resolve, reject) => {
        const u = [];
        for (let i = 0; i < users.length; i++) {
          u.push(models.user.findOne({ id: users[i].id }).lean());
        }
        Promise.all(u).then((data) => {
          resolve(data);
        }).catch((err) => {
          reject(err);
        });
      }));
    },
  },
};
