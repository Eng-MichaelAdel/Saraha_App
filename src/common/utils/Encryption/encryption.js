import { ENCRYPTION_KEY, IV_LENGTH } from "../../../../config/config.service.js";
import crypto from "crypto";

export const encrypt = (plainText) => {
  const IV = crypto.randomBytes(parseInt(IV_LENGTH));

  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY, "hex"), IV);
  let encryption = cipher.update(plainText, "utf-8", "hex");
  encryption += cipher.final("hex");

  return IV.toString("hex") + ":" + encryption;
};
