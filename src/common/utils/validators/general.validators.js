import Joi from "joi";
import { genderEnum, providerEnum, roleEnum, statusEnum } from "../../enums/user.enums.js";
import { Types } from "mongoose";


const isObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value) ? true : helper.message("Invalid ObjectId");
};

export const generalValidators = {
  user: {
    id: Joi.string().custom(isObjectId),

    firstName: Joi.string().alphanum().lowercase().min(2).max(25),

    lastName: Joi.string().alphanum().lowercase().min(2).max(20),

    email: Joi.string()
      .trim()
      .email({ minDomainSegments: 2, maxDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .messages({ "string.email": "Email must be a valid email address , example : example@anything.com or  example@anything.net" }),

    password: Joi.string()
      .pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/))
      .messages({ "string.pattern.base": "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character", "string.empty": "Password is required" }),

    confirmedPassword: Joi.valid(Joi.ref("password")).messages({ "any.only": "Passwords do not match" }),

    phone: Joi.string()
      .pattern(new RegExp(/^01(0|1|2|5)\d{8}$/))
      .messages({ "string.pattern.base": "Phone number must be a valid number (11 digits)" }),

    gender: Joi.string().valid(...Object.keys(genderEnum)),

    role: Joi.string().valid(...Object.values(roleEnum)),
    status: Joi.string().valid(...Object.values(statusEnum)),
    provider: Joi.string().valid(...Object.values(providerEnum)),
    profielPictuer: Joi.string(),
    coverProfilePicture: Joi.array().items(Joi.string()),
    googleSub: Joi.string(),
    otp:Joi.string().length(6)
  },
  file: Joi.object({
      fieldname: Joi.string().required(),
      originalname: Joi.string().required(),
      encoding: Joi.string().required(),
      mimetype: Joi.string().required(),
      destination: Joi.string().required(),
      filename: Joi.string().required(),
      path: Joi.string().required(),
      size: Joi.number().required(),

  }),
};
