import { gcp, JWT_SECRETS } from "../../../config/index.js";
import { del, emailEvent, expire, get, incr, keys, otpPurpose, otpState, otpSubjects, providerEnum, sendEmail, set, tokenTypeEnum, ttl } from "../../common/index.js";
import {
  compareHash,
  encrypt,
  generateHash,
  createLoginCredentials,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  decodeToken,
  otpTemplate,
  BadRequestException,
} from "../../common/utils/index.js";
import { UserRepository } from "../../db/repositories/index.js";
import { OAuth2Client } from "google-auth-library";
import userRepositories from "../../db/repositories/user.repositories.js";
import crypto, { randomUUID } from "crypto";
import { resolve } from "path";
const client = new OAuth2Client();

//* signup
export const signup = async (userInputs) => {
  //  check email exist
  const emailExist = await UserRepository.findOne({ filter: { email: userInputs.email }, select: { email: 1, _id: 0 }, options: { lean: true } });

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

  // create and Send Verification OTP mail
  await createAndSendOtp({
    email: userInputs.email,
    otpPurpose: otpPurpose.Email,
    expInMin: 2,
    emailTitle: "Verification Code",
    state: otpState.newOtp,
  });

  //  create user
  const user = await UserRepository.createOne({ data: userInputs });
  return user;
};

//* Resend OTP Email
export const resendRerifyEmailService = async (body) => {
  const { email } = body;

  // check user account is on DB
  const userAccount = await userRepositories.findOne({ filter: { email, provider: providerEnum.system, isEmailVerified: false } });
  if (!userAccount) {
    throw new NotFoundException("Fail to find matching account");
  }

  // create and Send Verification OTP mail
  await createAndSendOtp({
    email: email,
    otpPurpose: otpPurpose.Email,
    expInMin: 2,
    emailTitle: "Verification Code",
    state: otpState.resendOtp,
  });

  return;
};

//* Confirm Email
export const verifyEmailService = async (body) => {
  const { email, otp } = body;

  // check user account is on DB
  const userExist = await userRepositories.findOne({ filter: { email, provider: providerEnum.system, isEmailVerified: false } });
  if (!userExist) {
    throw new NotFoundException("Fail to find matching account");
  }

  // Verifying OTP and check the expiration (not expired)
  await verifyOtp({ email, otp, otpPurpose: otpPurpose.Email });

  // delete the saved OTP keys
  del(await keys(otpFormatKey(email, otpSubjects[otpPurpose.Email].confirm)));

  // Vapply confirmation to DB user account
  userExist.isEmailVerified = true;
  await userExist.save();
  return;
};

//* login
export const login = async (userInputs, issuer) => {
  const { email, password } = userInputs;

  //  check login credintial's validation
  const user = await UserRepository.findOne({ filter: { email, isEmailVerified: true } });
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

//* Request ForgotPassword Code
export const requestForgetPasswordCode = async (body) => {
  const { email } = body;

  // check user account is on DB
  const userAccount = await userRepositories.findOne({ filter: { email, provider: providerEnum.system, isEmailVerified: true } });
  if (!userAccount) {
    throw new NotFoundException("user is not Regestered");
  }

  // create and Send Verification OTP mail
  await createAndSendOtp({
    email: email,
    otpPurpose: otpPurpose.Password,
    expInMin: 2,
    emailTitle: "Reset Code",
    state: otpState.resendOtp,
  });

  return;
};

//* Verify ForgotPassword Code
export const verifyForgetPasswordCode = async (body) => {
  const { email, otp } = body;

  // Verifying OTP and check the expiration (not expired)
  await verifyOtp({ email, otp, otpPurpose: otpPurpose.Password });

  return;
};

//* reset ForgotPassword Code
export const resetForgetPassword = async (body) => {
  const { email, otp, password, confirmedPassword } = body;

  // Verifying OTP and check the expiration (not expired)
  await verifyOtp({ email, otp, otpPurpose: otpPurpose.Password });

  // check user account and update password on DB
  const userAccount = await userRepositories.findOneAndUpdate({
    filter: { email, provider: providerEnum.system, isEmailVerified: true },
    updates: { password: await generateHash(password), confirmedPassword: await generateHash(confirmedPassword), logoutCredentialTime: Date.now() },
  });
  if (!userAccount) {
    throw new NotFoundException("user is not Regestered");
  }

  // delete the saved OTP keys
  const otpKeys = await keys(otpFormatKey(email, otpSubjects[otpPurpose.Password].confirm));
  const existsRevokedKeys = await keys(`${baseRT_key(userAccount._id)}*`);
  del([...otpKeys, ...existsRevokedKeys]);

  return;
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

// ^ Helper Functions create OTP Keys

export const otpFormatKey = (email, otpSubject) => {
  if (!otpSubject) {
    return `OTP::${email}`;
  }
  return `OTP::${email}::${otpSubject}`;
};

export const checkOtp_Blocking_MaxTrials = async (email, state, otpPurpose) => {
  if (state === otpState.resendOtp) {
    console.log(state);

    // check if the user ruin the max trials and is blocked
    const [maxTrials, BlockTime] = await Promise.all([get(otpFormatKey(email, otpSubjects[otpPurpose].maxTrials)), ttl(otpFormatKey(email, otpSubjects[otpPurpose].maxTrials))]);
    if (maxTrials && maxTrials >= 3 && BlockTime > 0) {
      throw new BadRequestException(`your account is Blocked ,sorry we can't request a new OTP "you reached the max trials" ,, please try again after ${BlockTime} sec.`);
    }

    // check if the existance OTP is valid or expired
    const remainingOtpTTL = await ttl(otpFormatKey(email, otpSubjects[otpPurpose].confirm));
    if (remainingOtpTTL > 0) {
      throw new BadRequestException(`sorry we can't request a new OTP while the current OTP is still valid ,, please try again after ${remainingOtpTTL} sec.`);
    }
  }
};

export const setOtpKeysToDataBase = async (email, otp, otpPurpose, expInMin, state) => {
  set({
    key: otpFormatKey(email, otpSubjects[otpPurpose].confirm),
    value: await generateHash(`${otp}`),
    options: { EX: expInMin * 60 },
  });

  if (state === otpState.resendOtp) {
    const maxTrialKey = otpFormatKey(email, otpSubjects[otpPurpose].maxTrials);
    await incr(maxTrialKey);
    const maxTrialTTL = await ttl(maxTrialKey);
    if (maxTrialTTL === -1) {
      await expire({ key: maxTrialKey, ttl: expInMin * 3 * 60 });
    }
  } else {
    set({ key: otpFormatKey(email, otpSubjects[otpPurpose].maxTrials), value: 1, options: { EX: expInMin * 3 * 60 } });
  }
  return;
};

export const createAndSendOtp = async ({ email, otpPurpose, expInMin, emailTitle, state }) => {
  // if resending new Otp .. check blocking or max trials first
  await checkOtp_Blocking_MaxTrials(email, state, otpPurpose);

  // then create otp send email by the code
  const otp = Math.floor(Math.random() * 900000 + 100000);
  emailEvent.emit("sendEmail", {
    to: email,
    cc: "michael_civilengineer@yahoo.com",
    subject: otpSubjects[otpPurpose].confirm,
    html: otpTemplate({ otp, expiration: expInMin, title: emailTitle }),
  });

  // save the otp Keys to database
  setOtpKeysToDataBase(email, otp, otpPurpose, expInMin, state);
  return;
};

export const verifyOtp = async ({ email, otp, otpPurpose }) => {
  // check existance of OTP for these user (not expired)
  const hashedOtp = await get(otpFormatKey(email, otpSubjects[otpPurpose].confirm));
  if (!hashedOtp) {
    throw new NotFoundException("OTP is Expired");
  }

  // check verify the OTP
  if (!(await compareHash(otp, hashedOtp))) {
    throw new ConflictException("Invalid OTP");
  }

  return;
};
