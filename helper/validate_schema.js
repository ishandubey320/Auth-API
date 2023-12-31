const Joi = require("@hapi/joi");

const authSchema = Joi.object({
  email: Joi.string().lowercase().email().required(),
  password: Joi.string().min(3).required(),
  userName: Joi.string(),
});

module.exports = { authSchema };
