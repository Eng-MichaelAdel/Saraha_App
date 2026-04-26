import { Router } from "express";
import { successResponse } from "../../common/index.js";
import { createMessage, delMessageById, getAllMessages, getMessageById, getReceviedMessages, getSentMessages } from "./message.service.js";
import { messageAuthenticate, multerLocal, userAuthenticate, validation } from "../../middlewares/index.js";
import { getMessageByIdSchema, sendMessageSchema } from "../../validators/index.js";
const router = Router();

// * Create message
router.post("/:receverId", messageAuthenticate, multerLocal("message/media-attachment").array("attachment", 5), validation(sendMessageSchema), async (req, res, next) => {
  const mesage = await createMessage(req.body, req.params.receverId, req.files, req?.user);
  successResponse({ res, status: 201, message: "message sent", data: mesage });
});

// * Get All messages
router.get("/list", userAuthenticate, async (req, res, next) => {
  const mesages = await getAllMessages(req.user);
  successResponse({ res, data: { mesages } });
});

// * Get Sent messages
router.get("/list-sent", userAuthenticate, async (req, res, next) => {
  const mesages = await getSentMessages(req.user);
  successResponse({ res, data: { mesages } });
});

// * Get recevied messages
router.get("/list-recevied", userAuthenticate, async (req, res, next) => {
  const mesages = await getReceviedMessages(req.user);
  successResponse({ res, data: { mesages } });
});

// * Get message By Id
router.get("/:messageId", userAuthenticate, validation(getMessageByIdSchema), async (req, res, next) => {
  const mesage = await getMessageById(req.params.messageId, req.user);
  successResponse({ res, data: { mesage } });
});

// * Delete message By Id
router.delete("/delete/:messageId", userAuthenticate, validation(getMessageByIdSchema), async (req, res, next) => {
  const message = await delMessageById(req.params.messageId, req.user);
  successResponse({ res, message:"message deleted successfully" });
});


export default router;
