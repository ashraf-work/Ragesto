import { StatusCodes } from "http-status-codes";
import StripeWebhook from "../models/stripeWebhookModel.js";
import { WebhookServices } from "../services/index.js";
import { getStripeClient } from "../services/stripeService.js";
import CustomError from "../utils/ErrorResponse.js";

export const stripeWebhookController = async (req, res, next) => {
  try {
    console.log(req.body)
    const stripe = getStripeClient();
    const webhookSignature = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new CustomError(
        "Stripe webhook secret is not configured",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        webhookSignature,
        webhookSecret
      );
    } catch (error) {
      throw new CustomError(
        `Invalid Stripe webhook signature: ${error.message}`,
        StatusCodes.BAD_REQUEST
      );
    }

    const existingWebhook = await StripeWebhook.findOne({
      eventId: event.id,
      status: "processed",
    }).lean();

    if (existingWebhook) {
      return res.status(StatusCodes.OK).send("Webhook already processed");
    }

    const eventObject = event.data.object;
    const webhookDoc = await StripeWebhook.create({
      eventId: event.id,
      userId:
        eventObject?.metadata?.userId ||
        eventObject?.client_reference_id ||
        null,
      stripeSubscriptionId:
        typeof eventObject?.subscription === "string"
          ? eventObject.subscription
          : eventObject?.id?.startsWith("sub_")
          ? eventObject.id
          : null,
      stripeCheckoutSessionId:
        eventObject?.object === "checkout.session" ? eventObject.id : null,
      eventType: event.type,
      signature: webhookSignature,
      payload: event,
      status: "pending",
    });

    const message = await WebhookServices.StripeEventHandler(event);

    webhookDoc.status = "processed";
    webhookDoc.responseMessage = message;
    webhookDoc.processedAt = new Date();
    await webhookDoc.save();

    return res.status(StatusCodes.OK).send("Webhook processed successfully");
  } catch (error) {
    console.error("Stripe Webhook Error:", error);
    next(error);
  }
};
