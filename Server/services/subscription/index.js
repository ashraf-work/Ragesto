import { StatusCodes } from "http-status-codes";
import Subscription from "../../models/subscriptionModel.js";
import CustomError from "../../utils/ErrorResponse.js";
import Directory from "../../models/dirModel.js";
import { formatFileSize } from "../../utils/formatFileSize.js";
import createSubscription from "./createSubscription.js";
import subscriptionStatus from "./subscriptionStatus.js";
import cancelSubscription from "./cancelSubscription.js";
import getEligiblePlansForChange from "./getEligiblePlans.js";
import changePlan from "./changePlan.js";
import { createStripeCheckoutSession } from "../stripeService.js";

const handleNewSubscriptionCreation = async (user, planDetails, status) => {
  const subscriptionDoc = await Subscription.create({
    userId: user._id,
    planId: planDetails.id,
    status,
  });

  const session = await createStripeCheckoutSession({
    user,
    subscriptionDoc,
    planDetails,
  });

  return {
    newSubscriptionId: subscriptionDoc._id,
    ...session,
  };
};

/**
 * Upgrade or cycle-change service
 */
export const upgradeSubscriptionService = async ({ user, desirePlan }) => {
  return handleNewSubscriptionCreation(user, desirePlan, "pending");
};

/**
 * Downgrade service (with storage limit check)
 */
export const downgradeSubscriptionService = async ({ user, desirePlan }) => {
  // 1. Check for storage limits before downgrading
  const rootDir = await Directory.findOne({
    _id: user.rootDirId,
    userId: user._id,
  })
    .select("size")
    .lean();

  if (!rootDir) {
    throw new CustomError("Root directory not found", StatusCodes.NOT_FOUND);
  }

  const rootDirSize = rootDir.size;
  const desirePlanMaxStorageLimit = desirePlan.limits.storageBytes;

  if (rootDirSize > desirePlanMaxStorageLimit) {
    const excessStorage = rootDirSize - desirePlanMaxStorageLimit;
    throw new CustomError(
      `Your current storage usage exceeds the desired plan's limit by ${formatFileSize(excessStorage)}. Please free up at least ${formatFileSize(excessStorage)} of storage before downgrading.`,
      StatusCodes.BAD_REQUEST
    );
  }

  // 2. Proceed with subscription creation
  return handleNewSubscriptionCreation(user, desirePlan, "pending");
};

export default {
  CreateSubscription: createSubscription,
  Status: subscriptionStatus,
  CancelSubscription: cancelSubscription,
  GetEligiblePlansForChange: getEligiblePlansForChange,
  ChangePlan: changePlan,
};
