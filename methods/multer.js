const multer = require('multer');
const path = require('path');

const upload = multer({ dest: path.join(__dirname, '../views/img') });

module.exports = upload;
