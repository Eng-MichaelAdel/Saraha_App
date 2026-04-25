import messageModel from "../models/message.model.js";
import { BaseRepository } from "./base.repositories.js";

class MessageRepository extends BaseRepository {
  constructor() {
    super(messageModel);
  }
}

export default new MessageRepository();
