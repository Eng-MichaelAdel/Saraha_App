import mongoose from "mongoose";
import { genderEnum, providerEnum, roleEnum, statusEnum } from "../../common/enums/index.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: [2, `firstName cannot be less than 2 char .. you entered {VALUE}`],
      maxLength: [25, `secondName cannot be greater than 25 char .. you entered {VALUE}`],
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      minLength: [2, `firstName cannot be less than 2 char .. you entered {VALUE}`],
      maxLength: [25, `secondName cannot be greater than 25 char .. you entered {VALUE}`],
      trim: true,
    },
    email: { type: String, required: true, index: { name: "email_unique", unique: true } },
    password: { type: String, required: true },
    phone: String,

    gender: { type: String, enum: { values: Object.values(genderEnum), message: "{VALUE} is not a valid gender" }, default: genderEnum.male },
    role: { type: String, enum: Object.values(roleEnum), default: roleEnum.user },
    status: { type: String, enum: Object.values(statusEnum), default: statusEnum.active },

    confirmedEmail: Date,
    profielPictuer: String,
    coverProfilePicture: [String],
    provider: { type: String, enum: Object.values(providerEnum), default: providerEnum.system },
  },
  {
    timestamps: true,
    query: true,
    strictQuery: true,
    optimisticConcurrency: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

userSchema
  .virtual("userName")
  .get(function () {
    return this.firstName + " " + this.lastName;
  })
  .set(function (value) {
    const [firstName, lastName] = value.split(" ");
    this.set({ firstName, lastName });
  });

const user = mongoose.models.user || mongoose.model("user", userSchema);

export default user;
