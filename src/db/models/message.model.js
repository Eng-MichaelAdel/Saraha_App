import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      minLength: 2,
      maxLength: 10000,
      required: function () {
        return !this.attachments?.length;
      },
    },
    attachments: [String],
    receverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: { name: "idx_receverId" },
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      index: { name: "idx_senderId" },
    },
  },
  {
    timestamps: true,
    query: true,
    strictQuery: true,
    optimisticConcurrency: true,
  },
);

const messageModel = mongoose.models.message || mongoose.model("message", messageSchema);

export default messageModel;
