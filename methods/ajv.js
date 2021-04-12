const Ajv = require('ajv').default;

const ajv = new Ajv({ strict: true, allErrors: true });

const registerSchema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 1,
    },
    email: {
      type: 'string',
      minLength: 1,
      pattern: '^\\S+@\\S+$',
    },
    password: {
      type: 'string',
      minLength: 8,
      maxLength: 40,
      pattern: '((?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#!$%]).{8,40})',
    },
    required: ['username', 'email', 'password'],
    additionalProperties: false,
  },
};

const loginSchema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
    },
    password: {
      type: 'string',
      minLength: 8,
      maxLength: 40,
    },
  },
  required: ['username', 'password'],
  additionalProperties: false,
};

module.exports = {
  validatelogin(data) {
    if (data !== null && data !== undefined) {
      const validate = ajv.compile(loginSchema);
      validate(data);
      return (validate.errors);
    }
    return ('No data received.');
  },
  validateregistration(data) {
    if (data !== null && data !== undefined) {
      const validate = ajv.compile(registerSchema);
      validate(data);
      return (validate.errors);
    }
    return ('No data received.');
  },
};
