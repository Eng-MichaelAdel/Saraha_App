import { userModel } from "../models/index.js";
import { BaseRepository } from "./base.repositories.js";

class UserRepository extends BaseRepository {
  constructor() {
    super(userModel);
  }
}

export default new UserRepository();
