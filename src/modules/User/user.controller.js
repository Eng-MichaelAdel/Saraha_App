import { Router } from "express";
import { successResponse } from "../../common/utils/index.js";
import { deleteUserAccount, getUserProfile, updateProfile, upploadProfilePic } from "./user.service.js";
import { authenticate, multerLocal } from "../../middlewares/index.js";

const router = Router();

// * get Profile
router.get("/profile", authenticate, async (req, res, next) => {
  const profile = await getUserProfile(req.user.userData);
  return successResponse({ res, data: { account: profile } });
});

// * update Profile
router.put("/update", authenticate, async (req, res, next) => {
  const updatedProfile = await updateProfile(req.user.userData, req.body);
  return successResponse({ res, message: "user Profile updated successfully", data: { account: updatedProfile } });
});

// * update Profile pic
router.patch("/upload/profilePc", authenticate, multerLocal("profiles").single("profielPictuer"), async (req, res, next) => {
  const user = await upploadProfilePic(req.user.userData, req.file);
  return successResponse({ res, message: "profile Picture Uploaded seccessfully", data: user });
});

// * delete Profile
router.delete("/delete", authenticate, async (req, res, next) => {
  await deleteUserAccount(req.user.userData);
  successResponse({ res, message: "user Deleted" });
});
export default router;
