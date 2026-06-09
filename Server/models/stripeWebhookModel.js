import { Schema, model } from "mongoose";

const stripeWebhookSchema = new Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    signature: {
      type: String,
      required: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    stripeSubscriptionId: {
      type: String,
      default: null,
    },
    stripeCheckoutSessionId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "processed", "failed"],
      default: "pending",
    },
    responseMessage: {
      type: String,
      default: "",
    },
    receivedAt: {
      type: Date,
      default: Date.now,
      index: { expires: "7d" },
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const StripeWebhook = model("StripeWebhook", stripeWebhookSchema);

export default StripeWebhook;
