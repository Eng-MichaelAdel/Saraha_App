import { decrypt, encrypt, errorResponse } from "../../common/utils/index.js";
import { userModel } from "../../db/models/index.js";

export const signup = async (userInputs) => {
  const { firstName, lastName, email, password, phone, gender } = userInputs;
  const checkUserExist = await userModel.findOne({ email });
  if (checkUserExist) {
    errorResponse({ status: 409, message: "email is already exist" });
  }
  const userObject = { firstName, lastName, email, password, phone, gender };
  if (phone) {
    userObject.phone = encrypt(phone);
  }
  const user = await userModel.create(userObject);
  return user;
};

export const login = async (userInputs) => {
  const { email, password } = userInputs;
  const checkUserExist = await userModel.findOne({ email, password });
  if (!checkUserExist) {
    errorResponse({ status: 404, message: "Invalid Login Credentials" });
  }
  checkUserExist.phone = decrypt(checkUserExist.phone);
  return checkUserExist;
};
