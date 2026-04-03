import { decrypt } from "../../common/utils/index.js";
import { decodeToken } from "../../common/utils/index.js";

export const getUserProfile = async (headrs) => {
  //  get access token
  const accessToken = headrs.authorization;

  //  get profile
  const user = await decodeToken({ token: accessToken });

  //  decrypt phone no
  user.phone = decrypt(user.phone);

  return user;
};
