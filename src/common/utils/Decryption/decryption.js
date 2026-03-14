import crypto from "crypto";
import { ENCRYPTION_KEY } from "../../../../config/config.service.js";

export const decrypt = (encryptedText) => {
  const [IV, Encryption] = encryptedText.split(":");
  const bufferdIV = Buffer.from(IV, "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY, "hex"), bufferdIV);
  let decryption = decipher.update(Encryption, "hex", "utf-8");
  decryption += decipher.final("utf-8");

  return decryption;
};
