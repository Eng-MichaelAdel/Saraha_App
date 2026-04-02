import { compare, hash } from "bcrypt";
import { SALT_ROUND } from "../../../../config/config.service.js";

export const generateHash = async (plainText) => {
  return hash(plainText, SALT_ROUND);
};

export const compareHash = async (password, hashedPassword) => {
  let match = false;
  
  if (await compare(password, hashedPassword)) {
    match = true;
  }
  return match;
};
