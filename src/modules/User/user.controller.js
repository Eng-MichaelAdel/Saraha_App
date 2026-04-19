import { Router } from "express";
import { successResponse } from "../../common/utils/index.js";
import { deleteUserAccount, getSharedProfile, getUserProfile, updateProfile, upploadProfileCover, upploadProfilePic } from "./user.service.js";
import { authenticate, multerLocal, validation } from "../../middlewares/index.js";
import { SharedProfileSchema, updateProfileImageShcema, updateProfileShcema, uploadCoverPicSchema } from "../../validators/user.validator.js";

const router = Router();

// * get Profile
router.get("/profile", authenticate, async (req, res, next) => {
  const profile = await getUserProfile(req.user);
  return successResponse({ res, data: { account: profile } });
});

// * update Profile
router.put("/update", authenticate, validation(updateProfileShcema), async (req, res, next) => {
  const updatedProfile = await updateProfile(req.user, req.body);
  return successResponse({ res, message: "user Profile updated successfully", data: { account: updatedProfile } });
});

// * update Profile pic
router.patch("/upload/profile-image", authenticate, multerLocal("profile/image").single("profielPictuer"), validation(updateProfileImageShcema), async (req, res, next) => {
  const user = await upploadProfilePic(req.user, req.file);
  return successResponse({ res, message: "profile Picture Uploaded seccessfully", data: user });
});

// * update Cover Pic
router.patch("/upload/profile-cover", authenticate, multerLocal("profile/cover").array("profielcover", 5), validation(uploadCoverPicSchema), async (req, res, next) => {
  const user = await upploadProfileCover(req.user, req.files);
  return successResponse({ res, message: "profile cover Pictures is Uploaded seccessfully", data: user });
});

// * get Shared Profile
router.get("/:userId/shared-profile", validation(SharedProfileSchema), async (req, res, next) => {
  const profile = await getSharedProfile(req.params.userId);
  return successResponse({ res, data: { profile } });
});

// * delete Profile
router.delete("/delete", authenticate, async (req, res, next) => {
  await deleteUserAccount(req.user);
  successResponse({ res, message: "user Deleted" });
});


export default router;
