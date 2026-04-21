import { gcp, JWT_SECRETS } from "../../../config/index.js";
import { del, keys, providerEnum, set, tokenTypeEnum } from "../../common/index.js";
import { compareHash, encrypt, generateHash, createLoginCredentials, UnauthorizedException, ConflictException, NotFoundException, ForbiddenException, decodeToken } from "../../common/utils/index.js";
import { UserRepository } from "../../db/repositories/index.js";
import { OAuth2Client } from "google-auth-library";
import userRepositories from "../../db/repositories/user.repositories.js";
import crypto, { randomUUID } from "crypto";
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
export const refreshTokenService = (decodedData, issuer) => {
  //  check if the sent token is refresh one
  if (decodedData.tokenType !== "refresh") {
    throw new UnauthorizedException("invalid token type ,expected refresh token");
  }

  //  stop generatingnew access token until the used one is expired
  const expOfAccessToken = JWT_SECRETS[decodedData.role].accessExp;
  if ((decodedData.iat + expOfAccessToken) * 1000 > Date.now()) {
    throw new ConflictException("current acces token is still valid");
  }

  //  create access and refresh token
  const { accessToken, refreshToken } = buildTokens(decodedData, issuer);

  //  added the used refresh token as revoked one
  const { id: refreshUserId, jti: refreshJti, exp: refreshExp } = decodedData;
  createBlacklistToken({ key: RevokenKeyFormat(refreshUserId, refreshJti), value: refreshJti, tokenExp: refreshExp });
  
  return { accessToken, refreshToken };
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

// * Logout
export const logoutService = async (userAccount, accessDecodedData, refreshToken, logoutFromAll) => {
  switch (logoutFromAll) {
    case "true":
      userAccount.logoutCredentialTime = Date.now();
      await userAccount.save();
      const existsRevokedKeys = await keys(`${baseRT_key(userAccount._id)}*`);
      del(existsRevokedKeys);
      return "logout is done successfully from all devices";
      break;

    default:
      const { decodedData: refreshDecodedData } = await decodeToken({ token: refreshToken });
      if (accessDecodedData.id !== refreshDecodedData.id) {
        throw new UnauthorizedException("ACCESS_REFRESH_MISMATCH");
      }
      const { id: accessUserId, jti: accessJti, exp: accessExp } = accessDecodedData;
      const { id: refreshUserId, jti: refreshJti, exp: refreshExp } = refreshDecodedData;

      Promise.all([
        createBlacklistToken({ key: RevokenKeyFormat(accessUserId, accessJti), value: accessJti, tokenExp: accessExp }),
        createBlacklistToken({ key: RevokenKeyFormat(refreshUserId, refreshJti), value: refreshJti, tokenExp: refreshExp }),
      ]);

      return "logout is done successfully from your device";
      break;
  }
};

// ***** -------------------------------------------------------------------------------------------------------------------------------------- *******
// ^ Helper Functions for Google
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

// ^ Helper Functions for create Token
const buildTokens = (userData, issuer) => {
  const Credentials = createLoginCredentials({
    payload: { id: userData._id, email: userData.email, role: userData.role },
    options: {
      access: { expiresIn: JWT_SECRETS[userData.role].accessExp, jwtid: randomUUID(), issuer, audience: ["web", "mobile"] },
      refresh: { expiresIn: JWT_SECRETS[userData.role].refreshExp, jwtid: randomUUID(), issuer, audience: ["web", "mobile"] },
    },
  });
  return Credentials;
};

// ^ Helper Functions create revoked token
const calculateTTL = (tokenExpireTime) => {
  const currentTime = Math.floor(Date.now() / 1000);
  return tokenExpireTime - currentTime;
};
const createBlacklistToken = ({ key, value, tokenExp }) => {
  let ttlSeconds;
  if (tokenExp) {
    ttlSeconds = calculateTTL(tokenExp);
  }
  if (ttlSeconds <= 0) {
    console.log("Token is already Expired");
    return;
  }
  return set({ key, value, options: { EX: ttlSeconds } });
};
export const baseRT_key = (id) => {
  return `RT_${id}`;
};
export const RevokenKeyFormat = (id, jti) => {
  return `${baseRT_key(id)}_${jti}`;
};
