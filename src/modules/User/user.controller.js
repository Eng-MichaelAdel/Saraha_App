import { Router } from "express";
import { successResponse } from "../../common/utils/index.js";
import { getUserProfile, updateProfile } from "./user.service.js";

const router = Router();

router.get("/", async (req, res, next) => {
  const profile = await getUserProfile(req.headers);
  return successResponse({ res, data: { account: profile } });
});

router.put("/update", async (req, res, next) => {
  const updatedProfile = await updateProfile(req.headers, req.body);
  return successResponse({ res, data: { account: updatedProfile } });
});

export default router;
