import { JWT_SECRETS } from "../../../config/config.service.js";
import { tokenTypeEnum } from "../../common/enums/user.enums.js";
import { compareHash, encrypt, errorResponse, generateHash, createLoginCredentials, detectSignitureByRole } from "../../common/utils/index.js";
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
export const login = async (userInputs, issuer) => {
  const { email, password } = userInputs;

  //  check login credintial's validation
  const user = await UserRepository.findOne({ filter: { email } });
  if (!user || !(await compareHash(password, user.password))) {
    errorResponse({ status: 404, message: "Invalid Login Credentials" });
  }

  //  create access and refresh token
  const { accessToken, refreshToken } = createLoginCredentials({
    payload: { id: user._id, email: user.email, role: user.role },
    options: {
      access: { expiresIn: JWT_SECRETS[user.role].accessExp, issuer, audience: ["web", "mobile"], noTimestamp: true },
      refresh: { expiresIn: JWT_SECRETS[user.role].refreshExp, issuer, audience: ["web", "mobile"], noTimestamp: true },
    },
  });

  return { accessToken, refreshToken };
};

// * Refresh Token
export const refreshTokenService = (userData, issuer) => {
  const { decodedData } = userData;
  
  //  create access and refresh token
  const { accessToken } = createLoginCredentials({
    payload: { id: decodedData.id, email: decodedData.email, role: decodedData.role },
    options: {
      access: { expiresIn: JWT_SECRETS[decodedData.role].accessExp, issuer, audience: ["web", "mobile"], noTimestamp: true },
      refresh: { expiresIn: JWT_SECRETS[decodedData.role].refreshExp, issuer, audience: ["web", "mobile"], noTimestamp: true },
    },
    requiredToken: tokenTypeEnum.access,
  });

  return { accessToken };
};
