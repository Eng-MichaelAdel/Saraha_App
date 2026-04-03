import jwt from "jsonwebtoken";
import userRepositories from "../../../db/repositories/user.repositories.js";
import { errorResponse } from "../respose/error.response.js";
import { JWT_SECRETS } from "../../../../config/config.service.js";
import { roleEnum } from "../../enums/user.enums.js";

export const generateToken = ({ payload, secret, options }) => {
  return jwt.sign(payload, secret, options);
};

export const verifyToken = ({ token, secret, options }) => {
  return jwt.verify(token, secret);
};

export const createAccesToken = ({ payload, secret, options }) => {
  const accessToken = generateToken({ payload, secret, options });
  return { accessToken };
};

export const decodeToken = ({ token }) => {
  //  decode token to get role
  const decodeData = jwt.decode(token);

  //  check id and role are sent through payload
  if (!decodeData.id || !decodeData.role) {
    return errorResponse({ message: "invalid payload", status: 400 });
  }

  //  detect Signiture due to Role
  const { accessSignature } = detectSignitureByRole(decodeData.role);

  //  verify token
  const userData = verifyToken({ token, secret: accessSignature });

  //  return user
  return userRepositories.findById({ id: userData.id });
};

export const detectSignitureByRole = (role) => {
  let signature = JWT_SECRETS.user;
  if (role === roleEnum.admin) {
    signature = JWT_SECRETS.admin;
  }
  return signature;
};
