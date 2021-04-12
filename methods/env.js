require('dotenv').config({
  path: '.env',
});

const env = {
  mongoUrl: process.env.MONGO_URL,
  sessionSecret: process.env.SESSION_SECRET,
  httpOnly: (process.env.HTTP_ONLY.toLowerCase() === 't' || process.env.HTTP_ONLY.toLowerCase() === 'true'),
  certFullChainPath: process.env.CERT_FULL_CHAIN_PATH,
  certPrivateKeyPath: process.env.CERT_PRIVATE_KEY_PATH,
  env: process.env.ENV.toLowerCase(),
  port: process.env.PORT.toLowerCase(),
};

for (const key in env) {
  if (env[key] === null || env[key] === undefined || env[key] === '') {
    throw new Error(`Environment variable: ${key.replace(/(.)([A-Z])/gm, '$1_$2').toUpperCase()} was not defined\nProgram exited with code: 1`);
  }
}

module.exports = env;
