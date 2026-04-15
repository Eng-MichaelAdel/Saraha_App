import Joi from "joi";
import { generalValidators } from "../common/utils/index.js";

export const loginSchema = {
  body: Joi.object({
    email: generalValidators.email.required(),
    password: generalValidators.password.required(),
  }),
};

export const signupSchema = {
  body: loginSchema.body.append({
    firstName: generalValidators.firstName.required(),
    lastName: generalValidators.lastName.required(),
    confirmedPassword: generalValidators.confirmedPassword.required(),
    phone: generalValidators.phone.required(),
    gender: generalValidators.gender.required(),
    role: generalValidators.role,
  }),
};
