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
  file: generalValidators.file.required().messages({ "any.required": "no file uploaded .. pleasse upload file" }),
};

export const uploadCoverPicSchema = {
  files: Joi.array().items(generalValidators.file).required().required().messages({ "any.required": "no file uploaded .. pleasse upload file" }),
};

export const SharedProfileSchema = {
  params: Joi.object({
    userId: generalValidators.user.id.required(),
  }),
};

export const updatePasswordSchema = {
  body: Joi.object({
    oldPassword: generalValidators.user.password.required(),
    newPassword: generalValidators.user.password
      .invalid(Joi.ref("oldPassword"))
      .messages({
        "string.pattern.base": "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
        "string.empty": "Password is required",
        "any.invalid": "New password must be different from old password",
      })
      .required(),
    confirmNewPassword: Joi.valid(Joi.ref("newPassword")).messages({ "any.only": "new Passwords doesn't match" }),
  }),
};
