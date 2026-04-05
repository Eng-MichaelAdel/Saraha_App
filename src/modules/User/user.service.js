import { decrypt, encrypt, errorResponse, getPadyloadFromDecodedToken, getUserFromDecodedToken } from "../../common/utils/index.js";
import userRepositories from "../../db/repositories/user.repositories.js";

// * get Profile
export const getUserProfile = async (headers) => {
  //  get access token from headers
  const accessToken = headers.authorization;

  //  get profile
  const user = await getUserFromDecodedToken({ token: accessToken });

  //  decrypt phone no
  user.phone = decrypt(user.phone);

  return user;
};

// * update Profile
export const updateProfile = async (headers, updateData) => {
  //  get access token from headers
  const accessToken = headers.authorization;

  //  verify token and get payload data
  const { id } = getPadyloadFromDecodedToken({ token: accessToken });

  //  check if email already exist in another account
  if (updateData.email) {
    const emailExist = await userRepositories.findOne({ filter: { email: updateData.email }, select: { email: 1 } });
    if (emailExist && emailExist.id !== id) {
      errorResponse({ status: 409, message: "email is already exist" });
    }
  }

  //  check if phone is sent as required for update?? so apply encryption
  if (updateData.phone) {
    updateData.phone = encrypt(updateData.phone);
  }

  //  save all updates and get updated profile data
  const updatedProfile = await userRepositories.findByIdAndUpdate({ id, updates: { $set: { ...updateData } } });

  //  decrypt phone number for representation of the profile
  updatedProfile.phone = decrypt(updatedProfile.phone);

  return updatedProfile;
};

// * Delete account
export const deleteUserAccount = async (headers) => {
  //  get access token from headers
  const accessToken = headers.authorization;

  //  verify token and get payload data
  const { id } = getPadyloadFromDecodedToken({ token: accessToken });

  //  delete account
  const state = await userRepositories.deleteOne({ filter: {_id:id} });


  return;
};
