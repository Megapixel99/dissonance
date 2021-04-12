const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  id: Number,
  email: String,
  phone: Number,
  password: String,
  ip: [String],
  profile: {
    username: String,
    picture: String,
    status: String,
  },
});

const inviteSchema = mongoose.Schema({
  id: String,
  server: {
    id: Number,
    channel: {
      id: Number,
    },
  },
  active: {
    uses: Number,
    until: Date,
  },
});

const serverSchema = mongoose.Schema({
  id: Number,
  name: String,
  picture: String,
  users: [{
    id: Number,
    nickname: String,
  }],
  channels: [{
    name: String,
    id: Number,
    messages: [{
      id: Number,
      sent: Date,
      sender: String,
      message: String,
    }],
  }],
});

const groupChatSchema = mongoose.Schema({
  id: Number,
  name: String,
  picture: String,
  users: [{
    id: Number,
    nickname: String,
  }],
  messages: [{
    id: Number,
    sent: Date,
    sender: String,
    message: String,
  }],
});

module.exports = {
  server: mongoose.model('servers', serverSchema),
  user: mongoose.model('users', userSchema),
  invite: mongoose.model('invites', inviteSchema),
  groupChat: mongoose.model('groupChats', groupChatSchema),
};
