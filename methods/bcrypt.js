const bcrypt = require('bcrypt');

const saltRounds = 15;

module.exports = {
  compare(plaintextPassword, hash) {
    return (bcrypt.compareSync(plaintextPassword, hash));
  },
  generate(plaintextPassword) {
    return (bcrypt.hashSync(plaintextPassword, saltRounds));
  },
};
