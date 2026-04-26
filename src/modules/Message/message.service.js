import { NotFoundException } from "../../common/index.js";
import messageRepositories from "../../db/repositories/message.repositories.js";
import userRepositories from "../../db/repositories/user.repositories.js";

// * Create message
export const createMessage = async (body, receverId, files, user = undefined) => {
  if (!files && !body?.content) {
    throw new NotFoundException("Missing message content or attachments");
  }

  const attachments = files?.map(({ path }) => {
    return path;
  });

  const receiverAccount = await userRepositories.findById({ id: receverId, isEmailVerified: true });
  if (!receiverAccount) {
    throw new NotFoundException("Fail to find recever id ");
  }
  const message = await messageRepositories.createOne({ data: { content: body?.content, senderId: user?._id, receverId, attachments } });
  return message;
};

// * Get message By Id
export const getMessageById = async (messageId, user) => {
  const message = await messageRepositories.findOne({
    filter: { _id: messageId, $or: [{ receverId: user._id }, { senderId: user._id }] },
    select: { senderId: 0 },
  });

  if (!message) {
    throw new NotFoundException("Invalid message or not Authorized action");
  }

  return message;
};

// * Del message By Id
export const delMessageById = async (messageId, user) => {
  const message = await messageRepositories.deleteOne({
    filter: { _id: messageId, receverId: user._id },
  });

  if (!message.deletedCount) {
    throw new NotFoundException("No message founded");
  }

  return ;
};

// * Get All message
export const getAllMessages = async (user) => {
  const messages = await messageRepositories.find({
    filter: { $or: [{ receverId: user._id }, { senderId: user._id }] },
    select: { senderId: 0 },
  });

  if (messages.length === 0) {
    throw new NotFoundException("No messages found");
  }

  return messages;
};

// * Get Recevied messages
export const getReceviedMessages = async (user) => {
  const messages = await messageRepositories.find({
    filter: { receverId: user._id },
    select: { senderId: 0 },
  });

  if (messages.length === 0) {
    throw new NotFoundException("No messages found");
  }

  return messages;
};

// * Get Sent messages
export const getSentMessages = async (user) => {
  const messages = await messageRepositories.find({
    filter: { senderId: user._id },
    select: { senderId: 0 },
  });

  if (messages.length === 0) {
    throw new NotFoundException("No messages found");
  }

  return messages;
};
