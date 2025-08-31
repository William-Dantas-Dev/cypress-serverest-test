const Joi = require ('joi')

export const loginRequestSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(5).required()
})

export const loginResponseSchema = Joi.object({
  message: Joi.string().required(),
  authorization: Joi.string().pattern(/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/).required()
})
