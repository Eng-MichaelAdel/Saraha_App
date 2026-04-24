import { Router } from "express";
import { successResponse } from "../../common/index.js";
import { gmailLogInService, gmailRegisterService, login, logoutService, refreshTokenService, resendRerifyEmailService, signup, verifyEmailService } from "./auth.service.js";
import { authenticate } from "../../middlewares/authentication.middleware.js";
import { validation } from "../../middlewares/index.js";
import { confirmEmail, loginSchema, resendConfirmEmail, signupSchema } from "../../validators/auth.validator.js";

const router = Router();

//* signup
router.post("/signup", validation(signupSchema), async (req, res, next) => {
  const user = await signup(req.body);
  successResponse({ res, status: 201, message: "user added successfully", data: { user } });
});

// * verifyEmail
router.patch("/confirm-email", validation(confirmEmail), async (req, res, next) => {
  const result = await verifyEmailService(req.body);
  successResponse({ res, message: "your email is confirmed" });
});

//* Resend Verify Email
router.patch("/resend-confirm-email", validation(resendConfirmEmail), async (req, res, next) => {
  const result = await resendRerifyEmailService(req.body);
  successResponse({ res, message: "your email is confirmed" });
});

//* login
router.post("/login", validation(loginSchema), async (req, res, next) => {
  const issuer = `${req.protocol}://${req.host}`;
  const Token = await login(req.body, issuer);
  successResponse({ res, message: "Login Successfully", data: { Token } });
});

// * Refresh Token
router.post("/refreshToken", authenticate, async (req, res, next) => {
  const issuer = `${req.protocol}://${req.host}`;
  const Token = await refreshTokenService(req.decode, issuer);
  successResponse({ res, message: "Token Refreshed Successfully", data: { Token } });
});

// * Gmail Registertion
router.post("/gmail/register", async (req, res, next) => {
  const issuer = `${req.protocol}://${req.host}`;
  const data = await gmailRegisterService(req.body, issuer);

  successResponse({ res, message: "User reqgistered successfully", data: { credentials: data } });
});

// * Gmail Login
router.post("/gmail/login", async (req, res, next) => {
  const issuer = `${req.protocol}://${req.host}`;
  const data = await gmailLogInService(req.body, issuer);

  successResponse({ res, message: "User Loggen in successfully", data: { credentials: data } });
});

//* Logout
router.post("/logout", authenticate, async (req, res, next) => {
  const message = await logoutService(req.user, req.decode, req.headers.refreshtoken, req.body.logoutFromAll);
  successResponse({ res, message });
});

export default router;
