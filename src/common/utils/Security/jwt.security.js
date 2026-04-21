import jwt from "jsonwebtoken";
import userRepositories from "../../../db/repositories/user.repositories.js";
import { JWT_SECRETS } from "../../../../config/index.js";
import { roleEnum, tokenTypeEnum } from "../../enums/user.enums.js";
import { BadRequestException, NotFoundException, UnauthorizedException } from "../respose/exceptions.error.js";
import { get } from "../../services/redis.service.js";
import { RevokenKeyFormat } from './../../../modules/Auth/auth.service.js';

export const generateToken = ({ payload, secret, options }) => {
  return jwt.sign(payload, secret, options);
};

export const verifyToken = ({ token, secret, options }) => {
  return jwt.verify(token, secret);
};

export const createLoginCredentials = ({ payload, options, requiredToken }) => {
  let accessToken, refreshToken, secret;
  switch (requiredToken) {
    case tokenTypeEnum.access:
      secret = detectSignitureByRoleAndTokenType(payload.role, tokenTypeEnum.access);
      accessToken = generateToken({
        payload: { ...payload, tokenType: tokenTypeEnum.access },
        secret,
        options: options.access,
      });
      break;

    case tokenTypeEnum.refresh:
      secret = detectSignitureByRoleAndTokenType(payload.role, tokenTypeEnum.refresh);
      refreshToken = generateToken({
        payload: { ...payload, tokenType: tokenTypeEnum.refresh },
        secret,
        options: options.refresh,
      });
      break;

    default:
      secret = detectSignitureByRoleAndTokenType(payload.role);
      accessToken = generateToken({
        payload: { ...payload, tokenType: tokenTypeEnum.access },
        secret: secret.accessSignature,
        options: options.access,
      });
      refreshToken = generateToken({
        payload: { ...payload, tokenType: tokenTypeEnum.refresh },
        secret: secret.refreshSignature,
        options: options.refresh,
      });
      break;
  }

  return { accessToken, refreshToken };
};

export const decodeToken = async ({ token }) => {
  //  decode token to get role
  const decodedData = jwt.decode(token);

  //  check id and role are sent through payload
  if (!decodedData.id || !decodedData.role) {
    throw new UnauthorizedException("invalid payload");
  }

  if (await get(RevokenKeyFormat(decodedData.id,decodedData.jti))) {
    throw new BadRequestException("Invalid login sesssion ,login again");
  }
  //  detect Signiture due to Role
  const secret = detectSignitureByRoleAndTokenType(decodedData.role, decodedData.tokenType);

  //  get user id
  const { id } = verifyToken({ token, secret });

  //  get user account
  const userData = await userRepositories.findById({ id });
  //  check if user account is available
  if (!userData) {
    throw new NotFoundException("invalid user credentials ,please register");
  }

  //  check if user loggedout
  if (userData.logoutCredentialTime && userData.logoutCredentialTime.getTime() >= decodedData.iat * 1000) {
    throw new NotFoundException("Invalid login sesssion");
  }

  return { userData, decodedData };
};

export const detectSignitureByRole = (role) => {
  let signature = JWT_SECRETS.user;
  if (role === roleEnum.admin) {
    signature = JWT_SECRETS.admin;
  }
  return signature;
};

export const detectSignitureByRoleAndTokenType = (role, tokenType = tokenTypeEnum.both) => {
  const signature = detectSignitureByRole(role);
  let secret;
  switch (tokenType) {
    case tokenTypeEnum.access:
      secret = signature.accessSignature;
      break;
    case tokenTypeEnum.refresh:
      secret = signature.refreshSignature;
      break;
    default:
      secret = signature;
      break;
  }

  return secret;
};
