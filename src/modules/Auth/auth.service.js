import { errorResponse } from "../../common/utils/index.js";
import { userModel } from "../../db/models/index.js";

export const signup = async (userInputs) => {
  const { firstName, lastName, email, password, phone, gender } = userInputs;
  const checkUserExist = await userModel.findOne({ email });
  if (checkUserExist) {
    errorResponse({ status: 409, message: "email is already exist" });
  }

  const user = await userModel.create({ firstName, lastName, email, password, phone, gender });
  return user;
};

export const login = async (userInputs) => {
  const { email, password } = userInputs;
  const checkUserExist = await userModel.findOne({ email, password });
  if (!checkUserExist) {
    errorResponse({ status: 404, message: "Invalid Login Credentials" });
  }

  return checkUserExist;
};
