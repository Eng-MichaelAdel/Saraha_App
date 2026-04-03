import { Router } from "express";
import { successResponse } from "../../common/utils/index.js";
import { getUserProfile } from "./user.service.js";

const router = Router();

router.get("/profile/:id", async (req, res, next) => {
  const profile = await getUserProfile(req.headers);
  return successResponse({ res, data: { account: profile } });
});


export default router