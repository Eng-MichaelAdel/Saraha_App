import { compareHash, decrypt, encrypt, errorResponse, generateHash, createAccesToken, detectSignitureByRole } from "../../common/utils/index.js";
import { UserRepository } from "../../db/repositories/index.js";

//* signup
export const signup = async (userInputs) => {
  //  check email exist
  const emailExist = await UserRepository.findOne({ filter: { email: userInputs.email }, select: { email: 1, _id: 0 }, options: { lean: true } });
  console.log(userInputs.email);

  if (emailExist) {
    errorResponse({ status: 409, message: "email is already exist" });
  }

  //  hash password
  userInputs.password = await generateHash(userInputs.password);

  //  encrypt phone
  if (userInputs.phone) {
    userInputs.phone = encrypt(userInputs.phone);
  }

  //  create user
  const user = await UserRepository.createOne({ data: userInputs });
  return user;
};

//* login
export const login = async (userInputs) => {
  const { email, password } = userInputs;

  //  check login credintial's validation
  const user = await UserRepository.findOne({ filter: { email } });
  if (!user || !(await compareHash(password, user.password))) {
    errorResponse({ status: 404, message: "Invalid Login Credentials" });
  }

  //  detect Signiture due to Role
  const { accessSignature, accessExp } = detectSignitureByRole(user.role);

  //  get acces token
  const { accessToken } = createAccesToken({
    payload: { id: user._id, email: user.email, role: user.role },
    secret: accessSignature,
    options: { expiresIn: accessExp, issuer: "http://localhost:3000", audience: ["web", "mobile"], noTimestamp: true },
  });

  return accessToken;
};
