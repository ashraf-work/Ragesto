import Stripe from "stripe";
import { StatusCodes } from "http-status-codes";
import CustomError from "../utils/ErrorResponse.js";
import { getPlanDetailsById } from "../utils/getPlanDetails.js";

let stripeClient;

export const getStripeClient = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new CustomError(
      "Stripe secret key is not configured",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  return stripeClient;
};

export const getClientUrl = () => {
  const url =
    process.env.CLIENT_URL ||
    process.env.CLIENT_URLS?.split(",").map((origin) => origin.trim())[0];

  return (url || "http://localhost:5173").replace(/\/$/, "");
};

export const getStripePriceId = (planId) => {
  const planDetails = getPlanDetailsById(planId);
  return planDetails?.stripePriceEnv
    ? process.env[planDetails.stripePriceEnv]
    : null;
};

export const createStripeCheckoutSession = async ({
  user,
  subscriptionDoc,
  planDetails,
}) => {
  const stripe = getStripeClient();
  const stripePriceId = getStripePriceId(planDetails.id);

  if (!stripePriceId) {
    throw new CustomError(
      `Stripe price ID is not configured for ${planDetails.id}`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  const metadata = {
    userId: user._id.toString(),
    subscriptionDocId: subscriptionDoc._id.toString(),
    planId: planDetails.id,
  };

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: stripePriceId, quantity: 1 }],
    success_url: `${getClientUrl()}/plans?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getClientUrl()}/plans?payment=cancelled`,
    client_reference_id: user._id.toString(),
    customer: subscriptionDoc.stripeCustomerId || undefined,
    customer_email: subscriptionDoc.stripeCustomerId ? undefined : user.email,
    metadata,
    subscription_data: { metadata },
    allow_promotion_codes: true,
  });

  if (!session.url) {
    throw new CustomError(
      "Stripe checkout URL was not returned",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  subscriptionDoc.stripePriceId = stripePriceId;
  subscriptionDoc.stripeCheckoutSessionId = session.id;
  subscriptionDoc.stripeCheckoutSessionUrl = session.url;
  if (typeof session.customer === "string") {
    subscriptionDoc.stripeCustomerId = session.customer;
  }
  await subscriptionDoc.save();

  return {
    checkoutSessionId: session.id,
    checkoutUrl: session.url,
  };
};

export const expireStripeCheckoutSession = async (sessionId) => {
  if (!sessionId) return;

  const stripe = getStripeClient();
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.status === "open") {
      await stripe.checkout.sessions.expire(sessionId);
    }
  } catch (error) {
    if (error?.code !== "resource_missing") {
      throw error;
    }
  }
};

export const cancelStripeSubscription = async (subscriptionId) => {
  if (!subscriptionId) return { success: true };

  const stripe = getStripeClient();
  const cancelled = await stripe.subscriptions.cancel(subscriptionId);
  return { success: cancelled.status === "canceled" };
};

export const pauseStripeSubscription = async (subscriptionId) => {
  if (!subscriptionId) return;

  const stripe = getStripeClient();
  await stripe.subscriptions.update(subscriptionId, {
    pause_collection: { behavior: "void" },
  });
};

export const resumeStripeSubscription = async (subscriptionId) => {
  if (!subscriptionId) return;

  const stripe = getStripeClient();
  await stripe.subscriptions.update(subscriptionId, {
    pause_collection: null,
  });
};
