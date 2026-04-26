import { BadRequestException, compareHash, ConflictException, decrypt, del, encrypt, generateHash, keys, UnauthorizedException } from "../../common/index.js";
import userRepositories from "../../db/repositories/user.repositories.js";
import { OAuth2Client } from "google-auth-library";
import { baseRT_key, buildTokens, logoutService, otpFormatKey } from "../Auth/auth.service.js";
import mongoose from "mongoose";
import messageRepositories from "../../db/repositories/message.repositories.js";

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

// * update Password
export const updatePassword = async (passwordData, userAccount, issuer) => {
  const { oldPassword, newPassword, confirmNewPassword } = passwordData;
  const { password: hashedPassword } = userAccount;

  // check if the old password entered is matching the user password
  const isPasswordMatched = await compareHash(oldPassword, hashedPassword);
  if (!isPasswordMatched) {
    throw new UnauthorizedException("Incorrect Current Password");
  }

  for (const hash of userAccount.oldPasswords) {
    if (await compareHash(newPassword, hash)) {
      throw new ConflictException("this password is already used before");
    }
  }

  // update Password and logeout from all devices
  userAccount.password = await generateHash(newPassword);
  userAccount.oldPasswords.push(userAccount.password);
  userAccount.confirmedPassword = await generateHash(confirmNewPassword);
  userAccount.logoutCredentialTime = Date.now();
  await userAccount.save();

  // delete the saved RevokedKeys keys
  const existsRevokedKeys = await keys(`${baseRT_key(userAccount._id)}*`);
  del([...existsRevokedKeys]);

  return buildTokens(userAccount, issuer);
};

// * update Profile Pic
export const uploadProfilePic = async (userProfile, fileData) => {
  //  get user id
  const { _id } = userProfile;

  if (!fileData || !fileData.path) {
    throw new BadRequestException("File is required");
  }

  //  supdate profile pic and return the updated user profile
  const updatedProfile = await userRepositories.findByIdAndUpdate({ id: _id, updates: { profielPictuer: fileData.path } });
  return updatedProfile;
};

// * update Profile cover Pics
export const uploadProfileCover = async (userProfile, fileData) => {
  //  get user id
  const { _id } = userProfile;

  if (!fileData) {
    throw new BadRequestException("File is required");
  }

  const coverPicPaths = fileData.map(({ path }) => {
    return path;
  });

  //  supdate profile pic and return the updated user profile
  const updatedProfile = await userRepositories.findByIdAndUpdate({ id: _id, updates: { coverProfilePicture: coverPicPaths } });
  return updatedProfile;
};

// * get Shared Profile
export const getSharedProfile = async (userId) => {
  const userProfile = await userRepositories.findById({ id: userId });
  if (!userProfile) {
    throw new BadRequestException("Invalid userId , user is not found");
  }
  return userProfile;
};

// * Delete account
export const deleteUserAccount = async (userProfile) => {
  //  get the user id from the user profile
  const { _id } = userProfile;

  const session = await mongoose.startSession();
  return (await session).withTransaction(async () => {
    //  delete all user messages
    await messageRepositories.deleteMany({ filter: { receverId: _id }, options: { session } });
    //  delete account
    await userRepositories.findByIdAndDelete({ id: _id, options: { session } });
  });
};
