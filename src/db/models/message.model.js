import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    receverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: { name: "idx_receverId" },
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
