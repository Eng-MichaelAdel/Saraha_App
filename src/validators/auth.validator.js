import Joi from "joi";
import { generalValidators } from "../common/index.js";

export const loginSchema = {
  body: Joi.object({
    email: generalValidators.user.email.required(),
    password: generalValidators.user.password.required(),
  }),
};

export const signupSchema = {
  body: loginSchema.body.append({
    firstName: generalValidators.user.firstName.required(),
    lastName: generalValidators.user.lastName.required(),
    confirmedPassword: generalValidators.user.confirmedPassword.required(),
    phone: generalValidators.user.phone.required(),
    gender: generalValidators.user.gender.required(),
    role: generalValidators.user.role,
  }),
};
