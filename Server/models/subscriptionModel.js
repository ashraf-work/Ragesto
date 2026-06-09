import { model, Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: {
      type: String,
      required: true,
    },
    stripeSubscriptionId: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    stripeCheckoutSessionId: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },
    stripeCheckoutSessionUrl: {
      type: String,
      default: null,
    },
    stripePriceId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: [
        "created", // subscription created but not paid
        "active", // payment success
        "past_due", // next payment failed
        "paused", // disable user
        "cancelled", // canceled immediately
        "pending", // plan-changing
        "renewal_failed", // next_due failed
      ],
      
      default: "created",
    },
    currentPeriodStart: {
      type: Date,
      default: null,
    },
    currentPeriodEnd: {
      type: Date,
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    invoiceId: {
      type: String,
      default: null,
    },
    invoiceUrl: {
      type: String,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    strict: "throw",
    timestamps: true,
  }
);

const Subscription = model("Subscription", subscriptionSchema);
export default Subscription;
