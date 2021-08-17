const Joib = require("@hapi/joi");
const Joi = require("joi")
const jp = require("joi-password");

const schemas = {
    registerSchema: Joib.object({
        uid: Joib.string(),
        userName: Joib.string().min(3).max(50),
        email: Joib.string().min(8).required().email().max(70),
        password: Joib.string().min(6).max(200).required(),
        emailVerified: Joib.bool()
    }),
    passwordChangeSchema: Joi.object({
        password: jp.JoiPasswordComplexity.string().minOfSpecialCharacters(2)
            .minOfLowercase(2).minOfUppercase(2).minOfNumeric(2).required(),
    })

}

module.exports = schemas;