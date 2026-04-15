import { Router } from "express";
import { successResponse } from "../../common/utils/index.js";
import { deleteUserAccount, getUserProfile, updateProfile } from "./user.service.js";
import { authenticate, authorize, validation } from "../../middlewares/index.js";
import { updateProfileShcema } from "../../validators/user.validator.js";

const router = Router();

// * get Profile
router.get("/profile", authenticate, async (req, res, next) => {
  const profile = await getUserProfile(req.user.userData);
  return successResponse({ res, data: { account: profile } });
});

// * update Profile
router.put("/update", authenticate, validation(updateProfileShcema), async (req, res, next) => {
  const updatedProfile = await updateProfile(req.user.userData, req.body);
  return successResponse({ res, message: "user Profile updated successfully", data: { account: updatedProfile } });
});

// * delete Profile
router.delete("/delete", authenticate, async (req, res, next) => {
  await deleteUserAccount(req.user.userData);
  successResponse({ res, message: "user Deleted" });
});
export default router;
