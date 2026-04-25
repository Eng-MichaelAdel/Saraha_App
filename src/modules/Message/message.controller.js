import { Router } from "express";
import { successResponse } from "../../common/index.js";
import { createMessage } from "./message.service.js";
import { messageAuthenticate, multerLocal, validation } from "../../middlewares/index.js";
import { sendMessageSchema } from "../../validators/index.js";
const router = Router();

router.post("/:receverId", messageAuthenticate, multerLocal("message/media-attachment").array("attachment", 5), validation(sendMessageSchema), async (req, res, next) => {
  const mesage = await createMessage(req.body, req.params.receverId, req.files ,req?.user);
  successResponse({ res, status: 201, message: "message sent", data: mesage });
});

export default router;
