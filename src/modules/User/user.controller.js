import { Router } from "express";
import { successResponse } from "../../common/index.js";
import { deleteUserAccount, getSharedProfile, getUserProfile, updatePassword, updateProfile, uploadProfileCover, uploadProfilePic } from "./user.service.js";
import { userAuthenticate, multerLocal, validation } from "../../middlewares/index.js";
import { SharedProfileSchema, updatePasswordSchema, updateProfileImageShcema, updateProfileShcema, uploadCoverPicSchema } from "../../validators/index.js";

const router = Router();

// * get Profile
router.get("/profile", userAuthenticate, async (req, res, next) => {
  const profile = await getUserProfile(req.user);
  return successResponse({ res, data: { account: profile } });
});

// * update Profile
router.put("/update", userAuthenticate, validation(updateProfileShcema), async (req, res, next) => {
  const updatedProfile = await updateProfile(req.user, req.body);
  return successResponse({ res, message: "user Profile updated successfully", data: { account: updatedProfile } });
});

// * update password
router.patch("/update-password", userAuthenticate, validation(updatePasswordSchema), async (req, res, next) => {
  const issuer = `${req.protocol}://${req.host}`;
  const user = await updatePassword(req.body, req.user, issuer);
  return successResponse({ res, message: "your password is updated seccessfully", data: user });
});

// * update Profile pic
router.patch("/upload/profile-image", userAuthenticate, multerLocal("profile/image").single("profielPictuer"), validation(updateProfileImageShcema), async (req, res, next) => {
  const user = await uploadProfilePic(req.user, req.file);
  return successResponse({ res, message: "profile Picture Uploaded seccessfully", data: user });
});

// * update Cover Pic
router.patch("/upload/profile-cover", userAuthenticate, multerLocal("profile/cover").array("profielcover", 5), validation(uploadCoverPicSchema), async (req, res, next) => {
  const user = await uploadProfileCover(req.user, req.files);
  return successResponse({ res, message: "profile cover Pictures is Uploaded seccessfully", data: user });
});

// * get Shared Profile
router.get("/:userId/shared-profile", validation(SharedProfileSchema), async (req, res, next) => {
  const profile = await getSharedProfile(req.params.userId);
  return successResponse({ res, data: { profile } });
});

// * delete Profile
router.delete("/delete", userAuthenticate, async (req, res, next) => {
  await deleteUserAccount(req.user);
  successResponse({ res, message: "user Deleted" });
});

export default router;
