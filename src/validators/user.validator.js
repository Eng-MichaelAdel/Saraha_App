import Joi from "joi";
import { generalValidators } from "../common/utils/index.js";

export const updateProfileShcema = {
  body: Joi.object({
    firstName: generalValidators.firstName,
    lastName: generalValidators.lastName,
    email: generalValidators.email,
    password: generalValidators.password,
    confirmedPassword: generalValidators.confirmedPassword,
    phone: generalValidators.phone,
    gender: generalValidators.gender,
    role: generalValidators.role,
  }),
};
