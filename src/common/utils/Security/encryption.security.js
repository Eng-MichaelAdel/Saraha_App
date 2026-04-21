import { ENCRYPTION_KEY, IV_LENGTH } from "../../../../config/index.js";
import crypto from "crypto";

export const encrypt = (plainText) => {
  const IV = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY, "hex"), IV);
  let encryption = cipher.update(plainText, "utf-8", "hex");
  encryption += cipher.final("hex");

  return IV.toString("hex") + ":" + encryption;
};

export const decrypt = (encryptedText) => {
  const [IV, Encryption] = encryptedText.split(":");
  const bufferdIV = Buffer.from(IV, "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY, "hex"), bufferdIV);
  let decryption = decipher.update(Encryption, "hex", "utf-8");
  decryption += decipher.final("utf-8");

  return decryption;
};
