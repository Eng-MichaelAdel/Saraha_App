import { Router } from "express";
import { successResponse } from "../../common/utils/index.js";
import { login, refreshTokenService, signup } from "./auth.service.js";
import { authenticate } from "../../middlewares/authentication.middleware.js";

const router = Router();

router.post("/signup", async (req, res, next) => {
  const user = await signup(req.body);
  successResponse({ res, status: 201, message: "user added successfully", data: { user } });
});

router.post("/login", async (req, res, next) => {
  const issuer = `${req.protocol}://${req.host}`
  const Token = await login(req.body , issuer);
  successResponse({ res, message: "Login Successfully",data:{Token} });
});

router.post("/refreshToken" ,authenticate, async (req, res, next) => {
  const issuer = `${req.protocol}://${req.host}`
  const Token = await refreshTokenService(req.user , issuer);
  successResponse({ res, message: "Token Refreshed Successfully",data:{Token} });
});

export default router;
