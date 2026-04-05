import { Router } from "express";
import { successResponse } from "../../common/utils/index.js";
import { deleteUserAccount, getUserProfile, updateProfile } from "./user.service.js";

const router = Router();

// * get Profile
router.get("/", async (req, res, next) => {
  const profile = await getUserProfile(req.headers);
  return successResponse({ res, data: { account: profile } });
});

// * update Profile
router.put("/update", async (req, res, next) => {
  const updatedProfile = await updateProfile(req.headers, req.body);
  return successResponse({ res, data: { account: updatedProfile } });
});

router.delete("/delete", async (req, res, next) => {
  await deleteUserAccount(req.headers);
  successResponse({ res, message:"user Deleted" });
});
export default router;
