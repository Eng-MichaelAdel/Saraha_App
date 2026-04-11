import { ConflictException, decrypt, encrypt } from "../../common/utils/index.js";
import userRepositories from "../../db/repositories/user.repositories.js";

// * get Profile
export const getUserProfile = async (userProfile) => {
  if (userProfile.phone) {
    //  decrypt phone no
    userProfile.phone = decrypt(userProfile.phone);
  }

  return userProfile;
};

// * update Profile
export const updateProfile = async (userProfile, updateData) => {
  //  get user id
  const { _id } = userProfile;

  //  check if email already exist in another account
  if (updateData.email) {
    const emailExist = await userRepositories.findOne({ filter: { email: updateData.email }, select: { email: 1 } });
    // console.log(emailExist.id);

    if (emailExist && emailExist.id !== _id.toString()) {
      throw new ConflictException("email is already exist");
      ;
    }
  }

  //  check if phone is sent as required for update?? so apply encryption
  if (updateData.phone) {
    updateData.phone = encrypt(updateData.phone);
  }

  //  save all updates and get updated profile data
  const updatedProfile = await userRepositories.findByIdAndUpdate({ id: _id, updates: { ...updateData } });

  //  decrypt phone number for representation of the profile
  updatedProfile.phone = decrypt(updatedProfile.phone);

  return updatedProfile;
};

// * Delete account
export const deleteUserAccount = async (userProfile) => {
  //  get the user id from the user profile
  const { _id } = userProfile;
  console.log();

  //  delete account
  const state = await userRepositories.deleteOne({ filter: { _id } });

  console.log(state);

  return;
};
