import { compareHash, decrypt, encrypt, errorResponse, generateHash } from "../../common/utils/index.js";
import { userModel } from "../../db/models/index.js";

export const signup = async (userInputs) => {
  const { firstName, lastName, email, password, phone, gender } = userInputs;
  const emailExist = await userModel.findOne({ email });
  if (emailExist) {
    errorResponse({ status: 409, message: "email is already exist" });
  }
  const hashedPasswoed = await generateHash(password);
  const userObject = { firstName, lastName, email, password: hashedPasswoed, phone, gender };
  if (phone) {
    userObject.phone = encrypt(phone);
  }
  const user = await userModel.create(userObject);
  return user;
};

export const login = async (userInputs) => {
  const { email, password } = userInputs;
  const user = await userModel.findOne({ email });
  if (!user || !compareHash(password, user.password)) {
    errorResponse({ status: 404, message: "Invalid Login Credentials" });
  }
  user.phone = decrypt(user.phone);

  return user;
};
