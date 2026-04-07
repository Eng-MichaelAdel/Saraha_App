import { Router } from "express";
import { successResponse } from "../../common/utils/index.js";
import { deleteUserAccount, getUserProfile, updateProfile } from "./user.service.js";
import { authenticate, authorize } from "../../middlewares/index.js";
import { roleEnum } from "../../common/enums/user.enums.js";

const router = Router();

// * get Profile
router.get("/profile", authenticate, async (req, res, next) => {
  const profile = await getUserProfile(req.user);
  return successResponse({ res, data: { account: profile } });
});

// * update Profile
router.put("/update", authenticate, authorize(roleEnum.user), async (req, res, next) => {
  const updatedProfile = await updateProfile(req.user, req.body);
  return successResponse({ res, message: "user Profile updated successfully", data: { account: updatedProfile } });
});

router.delete("/delete", async (req, res, next) => {
  await deleteUserAccount(req.headers);
  successResponse({ res, message: "user Deleted" });
});
export default router;
