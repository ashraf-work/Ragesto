import { sendEventToUser } from "../../controllers/EventController.js";
import redisClient from "../../config/redis.js";
import File from "../../models/fileModel.js";
import Subscription from "../../models/subscriptionModel.js";
import User from "../../models/userModel.js";
import FileSerivces from "../file/index.js";
import { cancelStripeSubscription, getStripeClient } from "../stripeService.js";
import { getPlanDetailsById } from "../../utils/getPlanDetails.js";

const toDate = (seconds) => (seconds ? new Date(seconds * 1000) : null);

const getInvoiceDetails = (invoice) => {
  if (!invoice) return { invoiceId: null, invoiceUrl: null };

  return {
    invoiceId: invoice.id || null,
    invoiceUrl: invoice.hosted_invoice_url || null,
  };
};

const getSubscriptionId = (value) => {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
};

const retrieveStripeSubscription = async (subscriptionId) => {
  const stripe = getStripeClient();
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["latest_invoice"],
  });
};

const activateSubscription = async ({ subscriptionDoc, stripeSubscription }) => {
  const userId = subscriptionDoc.userId;
  const invoice = stripeSubscription.latest_invoice;
  const { invoiceId, invoiceUrl } = getInvoiceDetails(invoice);

  if (subscriptionDoc.status === "pending") {
    const oldSubscription = await Subscription.findOne({
      userId,
      status: "active",
      _id: { $ne: subscriptionDoc._id },
    });

    if (oldSubscription) {
      await cancelStripeSubscription(oldSubscription.stripeSubscriptionId);
      await Subscription.deleteOne({ _id: oldSubscription._id });
    }
  }

  subscriptionDoc.status = "active";
  subscriptionDoc.stripeSubscriptionId = stripeSubscription.id;
  subscriptionDoc.stripeCustomerId =
    typeof stripeSubscription.customer === "string"
      ? stripeSubscription.customer
      : stripeSubscription.customer?.id || subscriptionDoc.stripeCustomerId;
  subscriptionDoc.currentPeriodStart = toDate(
    stripeSubscription.current_period_start
  );
  subscriptionDoc.currentPeriodEnd = toDate(
    stripeSubscription.current_period_end
  );
  subscriptionDoc.startDate =
    subscriptionDoc.startDate || toDate(stripeSubscription.start_date);
  subscriptionDoc.endDate = stripeSubscription.ended_at
    ? toDate(stripeSubscription.ended_at)
    : null;
  subscriptionDoc.invoiceId = invoiceId;
  subscriptionDoc.invoiceUrl = invoiceUrl;
  await subscriptionDoc.save();

  const planDetails = getPlanDetailsById(subscriptionDoc.planId);

  await User.findByIdAndUpdate(userId, {
    maxStorageLimit: planDetails.limits.storageBytes,
    maxFileSize: planDetails.limits.maxFileSizeBytes,
    maxDevices: planDetails.limits.maxDevices,
    subscriptionId: subscriptionDoc._id,
    isDeleted: false,
  });

  sendEventToUser(userId.toString(), {
    type: "subscriptionActivated",
    plan: planDetails.name,
    message: "Your subscription has been activated!",
  });

  return "Subscription activated";
};

const handleCheckoutCompleted = async (session) => {
  if (session.mode !== "subscription" || !session.subscription) {
    return "Checkout session ignored";
  }

  const subscriptionDoc = await Subscription.findOne({
    $or: [
      { stripeCheckoutSessionId: session.id },
      ...(session.metadata?.subscriptionDocId
        ? [{ _id: session.metadata.subscriptionDocId }]
        : []),
    ],
  });

  if (!subscriptionDoc) {
    return "Subscription document not found for checkout session";
  }

  if (subscriptionDoc.status === "active") {
    return "Subscription already active";
  }

  const stripeSubscription = await retrieveStripeSubscription(
    getSubscriptionId(session.subscription)
  );

  return activateSubscription({ subscriptionDoc, stripeSubscription });
};

const handleInvoicePaid = async (invoice) => {
  const stripeSubscriptionId = getSubscriptionId(invoice.subscription);

  if (!stripeSubscriptionId) {
    return "Invoice has no subscription";
  }

  const subscriptionDoc = await Subscription.findOne({
    stripeSubscriptionId,
    status: { $in: ["active", "renewal_failed"] },
  });

  if (!subscriptionDoc) {
    return "Subscription not active yet; invoice ignored";
  }

  const stripeSubscription = await retrieveStripeSubscription(stripeSubscriptionId);
  const { invoiceId, invoiceUrl } = getInvoiceDetails(invoice);

  subscriptionDoc.status = "active";
  subscriptionDoc.currentPeriodStart = toDate(
    stripeSubscription.current_period_start
  );
  subscriptionDoc.currentPeriodEnd = toDate(
    stripeSubscription.current_period_end
  );
  subscriptionDoc.invoiceId = invoiceId;
  subscriptionDoc.invoiceUrl = invoiceUrl;
  await subscriptionDoc.save();

  return "Subscription renewal handled";
};

const handleInvoiceFailed = async (invoice) => {
  const stripeSubscriptionId = getSubscriptionId(invoice.subscription);

  if (!stripeSubscriptionId) {
    return "Invoice has no subscription";
  }

  const subscriptionDoc = await Subscription.findOne({
    stripeSubscriptionId,
  });

  if (!subscriptionDoc) {
    return "Subscription not found for failed invoice";
  }

  subscriptionDoc.status = "renewal_failed";
  await subscriptionDoc.save();

  return "Subscription marked as renewal_failed";
};

const handleSubscriptionDeleted = async (stripeSubscription) => {
  const subscriptionDoc = await Subscription.findOne({
    stripeSubscriptionId: stripeSubscription.id,
  });

  if (!subscriptionDoc) {
    return "Subscription not found for delete event";
  }

  const user = await User.findById(subscriptionDoc.userId).lean();
  if (!user) {
    await subscriptionDoc.deleteOne();
    return "User not found; subscription document removed";
  }

  const defaultPlan = getPlanDetailsById("default");

  await User.findByIdAndUpdate(user._id, {
    subscriptionId: null,
    maxStorageLimit: defaultPlan.limits.storageBytes,
    maxDevices: defaultPlan.limits.maxDevices,
    maxFileSize: defaultPlan.limits.maxFileSizeBytes,
    isDeleted: false,
  });

  if (subscriptionDoc.startDate) {
    const filesUploadedInSubscription = await File.find({
      userId: user._id,
      createdAt: { $gte: new Date(subscriptionDoc.startDate) },
    });

    for (const file of filesUploadedInSubscription) {
      await FileSerivces.DeleteFileService(file._id, user._id);
    }
  }

  await subscriptionDoc.deleteOne();

  return "Cancelled subscription and revoked access";
};

const handleSubscriptionUpdated = async (stripeSubscription) => {
  const subscriptionDoc = await Subscription.findOne({
    stripeSubscriptionId: stripeSubscription.id,
  });

  if (!subscriptionDoc) {
    return "Subscription not found for update event";
  }

  if (stripeSubscription.pause_collection) {
    subscriptionDoc.status = "paused";
    await subscriptionDoc.save();
    await redisClient.deleteManySessions(subscriptionDoc.userId);
    await User.findByIdAndUpdate(subscriptionDoc.userId, { isDeleted: true });
    return "Subscription paused";
  }

  if (
    subscriptionDoc.status === "paused" &&
    stripeSubscription.status === "active"
  ) {
    subscriptionDoc.status = "active";
    await subscriptionDoc.save();
    await User.findByIdAndUpdate(subscriptionDoc.userId, { isDeleted: false });
    return "Subscription resumed";
  }

  return "Subscription update ignored";
};

async function StripeEventHandler(event) {
  switch (event.type) {
    case "checkout.session.completed":
      return handleCheckoutCompleted(event.data.object);
    case "invoice.payment_succeeded":
      return handleInvoicePaid(event.data.object);
    case "invoice.payment_failed":
      return handleInvoiceFailed(event.data.object);
    case "customer.subscription.deleted":
      return handleSubscriptionDeleted(event.data.object);
    case "customer.subscription.updated":
      return handleSubscriptionUpdated(event.data.object);
    default:
      return `Unhandled event: ${event.type}`;
  }
}

export default {
  StripeEventHandler,
};
