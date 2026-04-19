import Joi from "joi";
import { generalValidators } from "../common/index.js";

export const updateProfileShcema = {
  body: Joi.object({
    firstName: generalValidators.user.firstName,
    lastName: generalValidators.user.lastName,
    email: generalValidators.user.email,
    password: generalValidators.user.password,
    confirmedPassword: generalValidators.user.confirmedPassword,
    phone: generalValidators.user.phone,
    gender: generalValidators.user.gender,
    role: generalValidators.user.role,
  }),
};

export const updateProfileImageShcema = {
  file: generalValidators.file().required().messages({ "any.required": "no file uploaded .. pleasse upload file" }),
};

export const uploadCoverPicSchema = {
  files: Joi.array().items(generalValidators.file().required()).required().messages({ "any.required": "no file uploaded .. pleasse upload file" }),
};

export const SharedProfileSchema = {
  params: Joi.object({
    userId: generalValidators.user.id.required(),
  }),
};
