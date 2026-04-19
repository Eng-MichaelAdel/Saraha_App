import { Router } from "express";
import { successResponse } from "../../common/utils/index.js";
import { gmailLogInService, gmailRegisterService, login, refreshTokenService, signup } from "./auth.service.js";
import { authenticate } from "../../middlewares/authentication.middleware.js";
import { validation } from "../../middlewares/index.js";
import { loginSchema, signupSchema } from "../../validators/auth.validator.js";

const router = Router();

router.post("/signup", validation(signupSchema), async (req, res, next) => {
  const user = await signup(req.body);
  successResponse({ res, status: 201, message: "user added successfully", data: { user } });
});

router.post("/login", validation(loginSchema), async (req, res, next) => {
  const issuer = `${req.protocol}://${req.host}`;
  const Token = await login(req.body, issuer);
  successResponse({ res, message: "Login Successfully", data: { Token } });
});

router.post("/refreshToken", authenticate, async (req, res, next) => {
  const issuer = `${req.protocol}://${req.host}`;
  const Token = await refreshTokenService(req.decode, issuer);
  successResponse({ res, message: "Token Refreshed Successfully", data: { Token } });
});

router.post("/gmail/register", async (req, res, next) => {
  const issuer = `${req.protocol}://${req.host}`;
  const data = await gmailRegisterService(req.body, issuer);

  successResponse({ res, message: "User reqgistered successfully", data: { credentials: data } });
});

router.post("/gmail/login", async (req, res, next) => {
  const issuer = `${req.protocol}://${req.host}`;
  const data = await gmailLogInService(req.body, issuer);

  successResponse({ res, message: "User Loggen in successfully", data: { credentials: data } });
});

export default router;
