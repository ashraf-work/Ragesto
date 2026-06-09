import { StatusCodes } from "http-status-codes";
import Subscription from "../../models/subscriptionModel.js";
import { getPlanDetailsById } from "../../utils/getPlanDetails.js";
import CustomError from "../../utils/ErrorResponse.js";
import {
  createStripeCheckoutSession,
  expireStripeCheckoutSession,
} from "../stripeService.js";

export default async function createSubscription(user, planId) {
  const planDetails = getPlanDetailsById(planId);

  if (!planDetails) {
    throw new CustomError("Plan ID is not valid", StatusCodes.BAD_REQUEST);
  }

  const activeSubscription = await Subscription.findOne({
    userId: user._id,
    status: "active",
  }).lean();

  if (activeSubscription) {
    throw new CustomError(
      "You already have an active subscription",
      StatusCodes.BAD_REQUEST
    );
  }

  let subscriptionDoc = await Subscription.findOne({
    userId: user._id,
    status: "created",
  });

  if (!subscriptionDoc) {
    subscriptionDoc = await Subscription.create({
      planId,
      userId: user._id,
      status: "created",
    });
  } else {
    await expireStripeCheckoutSession(subscriptionDoc.stripeCheckoutSessionId);
    if (subscriptionDoc.planId !== planId) {
      subscriptionDoc.planId = planId;
    }
    subscriptionDoc.stripeCheckoutSessionId = null;
    subscriptionDoc.stripeCheckoutSessionUrl = null;
    subscriptionDoc.stripePriceId = null;
  }

  const session = await createStripeCheckoutSession({
    user,
    subscriptionDoc,
    planDetails,
  });

  return {
    status: StatusCodes.CREATED,
    message: "Stripe checkout session created successfully",
    data: session,
  };
}
