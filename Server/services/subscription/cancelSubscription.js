import { StatusCodes } from "http-status-codes";
import Subscription from "../../models/subscriptionModel.js";
import CustomError from "../../utils/ErrorResponse.js";
import { cancelStripeSubscription } from "../stripeService.js";

export default async function cancelSubscription(user) {
  const subscriptionDoc = await Subscription.findOne({
    userId: user._id,
    _id: user.subscriptionId,
  });

  if (!subscriptionDoc || subscriptionDoc.status !== "active") {
    throw new CustomError("Subscription not found", StatusCodes.NOT_FOUND);
  }

  subscriptionDoc.status = "cancelled";
  subscriptionDoc.cancelledAt = new Date();
  await subscriptionDoc.save();

  await cancelStripeSubscription(subscriptionDoc.stripeSubscriptionId);

  return {
    message: "Subscription cancelled.",
    status: StatusCodes.OK,
  };
}
