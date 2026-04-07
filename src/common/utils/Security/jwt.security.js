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

export const createLoginCredentials = ({ payload, secret, options }) => {
  const accessToken = generateToken({ payload, secret, options });
  return { accessToken };
};

export const decodeToken = async ({ token }) => {
  //  decode token to get role
  const decodedData = jwt.decode(token);

  //  check id and role are sent through payload
  if (!decodedData.id || !decodedData.role) {
    return errorResponse({ message: "invalid payload", status: 400 });
  }

  //  detect Signiture due to Role
  const { accessSignature } = detectSignitureByRole(decodedData.role);

  //  get user id
  const { id } = verifyToken({ token, secret: accessSignature });

  //  get user account
  const user = await userRepositories.findById({ id });

  return user;
};

export const detectSignitureByRole = (role) => {
  let signature = JWT_SECRETS.user;
  if (role === roleEnum.admin) {
    signature = JWT_SECRETS.admin;
  }
  return signature;
};
