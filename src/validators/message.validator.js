import Joi from "joi";
import { generalValidators } from "../common/index.js";

export const sendMessageSchema = {
  params: Joi.object({ receverId: generalValidators.user.id.required() }),
  body: Joi.object({
    content: Joi.string().min(2).max(10000),
    senderId: generalValidators.user.id,
  }),
  files: Joi.array().items(generalValidators.file).messages({ "any.required": "no file uploaded .. pleasse upload file" }),
};

export const getMessageByIdSchema = {
  params: Joi.object({ messageId: generalValidators.user.id.required() }),
};
