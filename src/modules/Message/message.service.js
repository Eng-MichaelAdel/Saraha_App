import { NotFoundException } from "../../common/index.js";
import messageRepositories from "../../db/repositories/message.repositories.js";
import userRepositories from "../../db/repositories/user.repositories.js";

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
