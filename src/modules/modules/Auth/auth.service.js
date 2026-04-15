import { gcp, JWT_SECRETS } from "../../../../config/config.service.js";
import { providerEnum, tokenTypeEnum } from "../../common/enums/user.enums.js";
import { compareHash, encrypt, generateHash, createLoginCredentials, UnauthorizedException, ConflictException, NotFoundException, ForbiddenException } from "../../common/utils/index.js";
import { UserRepository } from "../../db/repositories/index.js";
import { OAuth2Client } from "google-auth-library";
import userRepositories from "../../db/repositories/user.repositories.js";
import crypto from "crypto";
const client = new OAuth2Client();

//* signup
export const signup = async (userInputs) => {
  //  check email exist
  const emailExist = await UserRepository.findOne({ filter: { email: userInputs.email }, select: { email: 1, _id: 0 }, options: { lean: true } });
  console.log(userInputs.email);

  if (emailExist) {
    throw new ConflictException("email is already exist");
  }

  //  hash password and confirmed password
  userInputs.password = await generateHash(userInputs.password);
  userInputs.confirmedPassword = await generateHash(userInputs.confirmedPassword);

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
    throw new UnauthorizedException("Invalid Login Credentials", {});
  }

  //  generate access and refresh token
  const { accessToken, refreshToken } = buildTokens(user, issuer);

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

// * Gmail Registertion
export const gmailRegisterService = async (body, issuer) => {
  const { idToken } = body;

  // verify gcp idToken
  const payload = await verifyGcpIdToken(idToken);

  //  find if the accunt is exist
  const user = await userRepositories.findOne({
    filter: {
      $or: [{ googleSup: payload.sub }, { email: payload.email }],
      provider: providerEnum.google,
    },
  });

  //  update the user account if exist else create a new one
  const userData = await handleUpdateOrCreateGoogleAccount(user, payload);

  //  generate access and refresh token
  const { accessToken, refreshToken } = buildTokens(userData, issuer);

  return { accessToken, refreshToken };
};

// * Gmail Login
export const gmailLogInService = async (body, issuer) => {
  const { idToken } = body;

  // verify gcp idToken
  const payload = await verifyGcpIdToken(idToken);

  //  find if the accunt is exist
  const user = await userRepositories.findOne({
    filter: {
      $or: [{ googleSup: payload.sub }, { email: payload.email }],
      provider: providerEnum.google,
    },
  });

  if (!user) {
    throw new NotFoundException("user not registered");
  }

  //  generate access and refresh token
  const { accessToken, refreshToken } = buildTokens(user, issuer);

  return { accessToken, refreshToken };
};

const verifyGcpIdToken = async (idToken) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: gcp.WEB_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  if (!payload) {
    throw new UnauthorizedException("Invalid token");
  } else if (!payload.email_verified) {
    throw new ForbiddenException("Email not verified");
  }
  return payload;
};

const handleUpdateOrCreateGoogleAccount = async (user, payload) => {
  const { given_name, family_name, email, picture, sub } = payload;
  if (user) {
    return await userRepositories.findByIdAndUpdate({
      id: user.id,
      updates: {
        firstName: given_name,
        lastName: family_name,
        email,
        profielPictuer: picture,
      },
    });
  } else {
    const hashedPassword = await generateHash(crypto.randomBytes(12).toString("hex"));
    return await userRepositories.createOne({
      data: {
        googleSub: sub,
        firstName: given_name,
        lastName: family_name,
        email,
        profielPictuer: picture,
        password: hashedPassword,
        provider: providerEnum.google,
      },
    });
  }
};

const buildTokens = (userData, issuer) => {
  const Credentials = createLoginCredentials({
    payload: { id: userData._id, email: userData.email, role: userData.role },
    options: {
      access: { expiresIn: JWT_SECRETS[userData.role].accessExp, issuer, audience: ["web", "mobile"], noTimestamp: true },
      refresh: { expiresIn: JWT_SECRETS[userData.role].refreshExp, issuer, audience: ["web", "mobile"], noTimestamp: true },
    },
  });
  return Credentials;
};
