import { Router } from "express";
import { successResponse } from "../../common/utils/index.js";
import { login, signup } from "./auth.service.js";

const router = Router();

router.post("/signup", async (req, res, next) => {
  const user = await signup(req.body);
  successResponse({ res, status: 201, message: "user added successfully", data: { user } });
});

router.post("/login", async (req, res, next) => {
  const Token = await login(req.body);
  successResponse({ res, message: "Login Successfully",data:{Token} });
});

export default router;
