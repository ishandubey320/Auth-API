const Joi = require("@hapi/joi");

const authSchema = Joi.object({
  email: Joi.string().lowercase().email().required(),
  password: Joi.string().min(3).required(),
});

module.exports = { authSchema };
