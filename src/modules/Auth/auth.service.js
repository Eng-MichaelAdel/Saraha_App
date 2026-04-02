import { compareHash, decrypt, encrypt, errorResponse, generateHash } from "../../common/utils/index.js";
import { UserRepository } from "../../db/repositories/index.js";

//* signup
export const signup = async (userInputs) => {
  const { firstName, lastName, email, password, phone, gender } = userInputs;
  const emailExist = await UserRepository.findOne({ filter: { email }, select: { email: 1,_id:0}, options: { lean: true } });

  if (emailExist) {
    errorResponse({ status: 409, message: "email is already exist" });
  }
  const hashedPasswoed = await generateHash(password);
  const userObject = { firstName, lastName, email, password: hashedPasswoed, phone, gender };
  if (phone) {
    userObject.phone = encrypt(phone);
  }
  const user = await UserRepository.createOne({ data: userObject });
  return user;
};


//* login
export const login = async (userInputs) => {
  const { email, password } = userInputs;
  const user = await UserRepository.findOne({ filter: { email }});

  if (!user || !(await compareHash(password, user.password))) {
    errorResponse({ status: 404, message: "Invalid Login Credentials" });
  }
  user.phone = decrypt(user.phone);

  return user;
};
