# Stripe Migration Guide - Razorpay to Stripe

> **Project:** Storage App (Cloud Storage SaaS)
> **Migration:** Razorpay Subscriptions API → Stripe Subscriptions API
> **Date Created:** April 5, 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Current Razorpay Architecture](#2-current-razorpay-architecture)
3. [Stripe Account Setup](#3-stripe-account-setup)
4. [Environment Variables Changes](#4-environment-variables-changes)
5. [Server-Side File Changes (18 Files)](#5-server-side-file-changes-18-files)
6. [Client-Side File Changes (4 Files)](#6-client-side-file-changes-4-files)
7. [Razorpay vs Stripe API Mapping](#7-razorpay-vs-stripe-api-mapping)
8. [Webhook Events Mapping](#8-webhook-events-mapping)
9. [Step-by-Step Migration Order](#9-step-by-step-migration-order)
10. [Stripe Products & Prices Setup](#10-stripe-products--prices-setup)
11. [Testing Checklist](#11-testing-checklist)

---

## 1. Overview

### Current State
The application currently uses **Razorpay Subscriptions API** for recurring billing. The integration includes:
- Subscription creation (12-month recurring)
- Plan switching (upgrade/downgrade)
- Webhook-based event handling (7 event types)
- User lifecycle management (pause/resume/cancel on soft-delete/recover/delete)
- Frontend Razorpay Checkout modal for payment

### Target State
Migrate to **Stripe Subscriptions API** with equivalent functionality:
- Stripe Checkout for payment flow
- Stripe Subscriptions for recurring billing
- Stripe Webhooks for event handling
- Equivalent user lifecycle management

### Key Differences to Understand

| Feature | Razorpay | Stripe |
|---------|----------|--------|
| **SDK Package** | `razorpay` (v2.9.6) | `stripe` |
| **Subscription Model** | `subscriptions.create({ plan_id, total_count })` | `stripe.subscriptions.create({ customer, price })` |
| **Plan ID Format** | `plan_xxxxxxxxxxxxxx` | `price_xxxxxxxxxxxxxxxxxxxxxxxx` |
| **Payment Flow** | Razorpay Checkout Modal (JS SDK) | Stripe Checkout (redirect URL) or Stripe Elements |
| **Webhook Verification** | `validateWebhookSignature()` | `stripe.webhooks.constructEvent()` |
| **Pause Subscription** | `subscriptions.pause(id, { pause_at: 'now' })` | `stripe.subscriptions.update(id, { pause_collection: 'void' })` |
| **Resume Subscription** | `subscriptions.resume(id, { resume_at: 'now' })` | `stripe.subscriptions.update(id, { pause_collection: null })` |
| **Cancel Subscription** | `subscriptions.cancel(id, false)` | `stripe.subscriptions.cancel(id)` |
| **Customer Required** | No (uses notes.userId) | **Yes** (must create Customer first) |

---

## 2. Current Razorpay Architecture

### Data Flow

```
Frontend (Plans.jsx)
    ↓ Click "Subscribe Now"
    ↓ Calls handleCreateSubscription(planId)
    ↓
Server: POST /subscription/create
    ↓ createSubscription controller
    ↓ createSubscription service
    ↓ razorpayInstance.subscriptions.create({ plan_id, total_count: 12, notes: { userId } })
    ↓ Returns subscriptionId
    ↓
Frontend: openRazorpayPopup(subscriptionId, userId, razorpayMode)
    ↓ Opens Razorpay Checkout modal
    ↓ User completes payment
    ↓
Razorpay → Webhook → POST /webhook/razorpay
    ↓ webhookControllers.js (validate signature)
    ↓ WebhookServices.RazorpayEventHandler(event, body)
    ↓ Event-specific handler (activated/cancelled/charged/etc.)
    ↓ Updates Subscription DB + User storage limits
    ↓ SSE event to frontend (subscriptionActivated)
```

### Files Currently Containing Razorpay Code

#### SERVER (18 files with Razorpay references):

| # | File Path | Lines with Razorpay | What It Does |
|---|-----------|---------------------|--------------|
| 1 | `Server/services/razorpayService.js` | 1-8 (entire file) | Razorpay SDK instance creation |
| 2 | `Server/controllers/webhookControllers.js` | 2, 3, 7, 10-17, 29, 36, 48 | Webhook receiver + signature validation |
| 3 | `Server/models/razorpayWebhookModel.js` | 3, 23, 51 | Webhook log model (razorpaySubscriptionId field) |
| 4 | `Server/models/subscriptionModel.js` | 14 | Subscription model (razorpaySubscriptionId field) |
| 5 | `Server/routes/webhookRoutes.js` | 2, 6 | Webhook route `/razorpay` |
| 6 | `Server/controllers/subscriptionControllers.js` | 86 | Subscription controllers (razorpaySubscriptionId query) |
| 7 | `Server/controllers/userControllers.js` | 23 | Returns `razorpayMode` to frontend |
| 8 | `Server/validators/commonValidation.js` | 27-29 | Plan ID regex validation (`^plan_[A-Za-z0-9]{14,20}$`) |
| 9 | `Server/services/subscription/createSubscription.js` | 5, 30-31, 33, 37, 53-54, 60, 68, 79, 95 | Create subscription via Razorpay API |
| 10 | `Server/services/subscription/cancelSubscription.js` | 4, 17-20 | Cancel subscription via Razorpay API |
| 11 | `Server/services/subscription/subscriptionStatus.js` | 82 | Invoice URL with RAZORPAY_INVOICE_LINK |
| 12 | `Server/services/subscription/index.js` | 4, 14-16, 17, 24, 29-34, 41, 52 | Subscription service exports + Razorpay calls |
| 13 | `Server/services/subscription/changePlan.js` | (indirect) | Uses upgrade/downgrade services that call Razorpay |
| 14 | `Server/services/user/index.js` | 16, 126-130, 213-216, 320-323, 350-351, 356 | Pause/resume/cancel Razorpay on user actions |
| 15 | `Server/services/webhook/index.js` | 9, 10-27, 31 | RazorpayEventHandler router |
| 16 | `Server/services/webhook/handleActivatedEvent.js` | 3, 12, 32-34, 47 | Handle subscription.activated webhook |
| 17 | `Server/services/webhook/handleCancelledEvent.js` | 21 | Handle subscription.cancelled webhook |
| 18 | `Server/services/webhook/handleChargedEvent.js` | 11 | Handle subscription.charged webhook |
| 19 | `Server/services/webhook/handleHaltedEvent.js` | 11, 17 | Handle subscription.halted webhook |
| 20 | `Server/services/webhook/handlePausedEvent.js` | (part of chain) | Handle subscription.paused webhook |
| 21 | `Server/services/webhook/handleResumeEvent.js` | (part of chain) | Handle subscription.resumed webhook |
| 22 | `Server/services/webhook/handlePaymentFailureEvent.js` | 10 | Handle subscription.pending webhook |
| 23 | `Server/utils/getPlanDetails.js` | 1-179 | Plan IDs hardcoded (Razorpay format) |

#### CLIENT (4 files with Razorpay references):

| # | File Path | Lines with Razorpay | What It Does |
|---|-----------|---------------------|--------------|
| 1 | `Client/src/Utils/openRazorpayPopup.js` | 3, 41-109 (entire file) | Opens Razorpay Checkout modal |
| 2 | `Client/src/Pages/SubscriptionPage/Plans.jsx` | 29-30, 49-50, 90-91, 112-113, 139, 212, 302 | Plan display with Razorpay plan IDs |
| 3 | `Client/src/Pages/SubscriptionPage/RenewalFailed.jsx` | 21 | Text mentioning "Razorpay will automatically retry" |
| 4 | `Client/src/Pages/SubscriptionPage/changePlanPage/PlanEligibleForSwtich.jsx` | 14, 31, 65, 112 | Plan switching with Razorpay plan IDs |

#### ENVIRONMENT FILES (2 files):

| # | File Path | Lines |
|---|-----------|-------|
| 1 | `Server/.env` | 67-78 |
| 2 | `Server/.env.local` | 39-50 |

---

## 3. Stripe Account Setup

### 3.1 Create Stripe Account
1. Go to https://dashboard.stripe.com/register
2. Complete account setup
3. Get API keys from Dashboard → Developers → API keys

### 3.2 Create Products & Prices
In Stripe Dashboard → Products, create:

**Product: "Pro Plan"**
- Monthly Price: ₹299 (recurring, monthly)
- Yearly Price: ₹2,999 (recurring, yearly)

**Product: "Premium Plan"**
- Monthly Price: ₹699 (recurring, monthly)
- Yearly Price: ₹6,999 (recurring, yearly)

### 3.3 Note the Price IDs
After creating prices, you'll get IDs like:
```
price_1Qxxxxxxxxxxxxxxxxxxxxxx  (Pro Monthly - Test)
price_1Qxxxxxxxxxxxxxxxxxxxxxx  (Pro Yearly - Test)
price_1Qxxxxxxxxxxxxxxxxxxxxxx  (Premium Monthly - Test)
price_1Qxxxxxxxxxxxxxxxxxxxxxx  (Premium Yearly - Test)
```

### 3.4 Configure Webhook
1. Go to Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/webhook/stripe`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.paused`
   - `customer.subscription.resumed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the **Webhook Signing Secret** (starts with `whsec_`)

### 3.5 Install Stripe Package
```bash
cd Server
npm uninstall razorpay
npm install stripe
```

---

## 4. Environment Variables Changes

### Current (.env and .env.local) - REPLACE THESE:
```env
# Razorpay Live Credentials
RAZORPAY_LIVE_KEY_ID=""
RAZORPAY_LIVE_KEY_SECRET=""

# Razorpay Test Credentials
RAZORPAY_TEST_KEY_ID=""
RAZORPAY_TEST_KEY_SECRET=""

RAZORPAY_WEBHOOK_SECRET=""
RAZORPAY_INVOICE_LINK=""

PAYMENT_ENV="test"
```

### New (.env and .env.local) - USE THESE:
```env
# Stripe Live Credentials
STRIPE_LIVE_SECRET_KEY=""
STRIPE_LIVE_PUBLISHABLE_KEY=""

# Stripe Test Credentials
STRIPE_TEST_SECRET_KEY=""
STRIPE_TEST_PUBLISHABLE_KEY=""

STRIPE_WEBHOOK_SECRET=""

# Stripe Price IDs (Test)
STRIPE_TEST_PRICE_PRO_MONTHLY=""
STRIPE_TEST_PRICE_PRO_YEARLY=""
STRIPE_TEST_PRICE_PREMIUM_MONTHLY=""
STRIPE_TEST_PRICE_PREMIUM_YEARLY=""

# Stripe Price IDs (Live)
STRIPE_LIVE_PRICE_PRO_MONTHLY=""
STRIPE_LIVE_PRICE_PRO_YEARLY=""
STRIPE_LIVE_PRICE_PREMIUM_MONTHLY=""
STRIPE_LIVE_PRICE_PREMIUM_YEARLY=""

PAYMENT_ENV="test"
```

---

## 5. Server-Side File Changes (18 Files)

### FILE 1: `Server/services/razorpayService.js`

**Action:** REWRITE → Rename to `stripeService.js`

**Current Code:**
```js
import Razorpay from "razorpay";

const env = process.env.PAYMENT_ENV;

export const razorpayInstance = new Razorpay({
  key_id: env === "test" ? process.env.RAZORPAY_TEST_KEY_ID : process.env.RAZORPAY_LIVE_KEY_ID,
  key_secret: env === "test" ? process.env.RAZORPAY_TEST_KEY_SECRET : process.env.RAZORPAY_LIVE_KEY_SECRET,
});
```

**New Code:**
```js
import Stripe from "stripe";

const env = process.env.PAYMENT_ENV;

export const stripeInstance = new Stripe(
  env === "test" ? process.env.STRIPE_TEST_SECRET_KEY : process.env.STRIPE_LIVE_SECRET_KEY,
  {
    apiVersion: "2025-01-27.acacia", // Use latest Stripe API version
  }
);
```

**Key Changes:**
- Import `stripe` instead of `razorpay`
- Export `stripeInstance` instead of `razorpayInstance`
- Stripe uses only secret key (no key_id/key_secret pair)

---

### FILE 2: `Server/controllers/webhookControllers.js`

**Action:** REWRITE

**Current Code:** Uses `validateWebhookSignature` from Razorpay, reads `x-razorpay-signature` header

**New Code:**
```js
import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";
import Webhook from "../models/stripeWebhookModel.js";
import { WebhookServices } from "../services/index.js";
import CustomError from "../utils/ErrorResponse.js";

export const stripeWebhookController = async (req, res, next) => {
  try {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = Stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      throw new CustomError("Invalid signature", StatusCodes.BAD_REQUEST);
    }

    const eventType = event.type;
    const subscription = event.data.object;

    // Extract userId from subscription metadata
    const userId = subscription.metadata?.userId;

    const webhookDoc = await Webhook.create({
      userId,
      stripeSubscriptionId: subscription.id,
      eventType: eventType,
      signature: sig,
      payload: event,
      status: "pending",
    });

    const message = await WebhookServices.StripeEventHandler(eventType, event);

    webhookDoc.status = "processed";
    webhookDoc.responseMessage = message;
    webhookDoc.processedAt = new Date();
    await webhookDoc.save();

    res.status(StatusCodes.OK).json({ received: true });
  } catch (error) {
    console.error("Stripe Webhook Error:", error);
    next(error);
  }
};
```

**Key Changes:**
- `validateWebhookSignature()` → `Stripe.webhooks.constructEvent()`
- `x-razorpay-signature` → `stripe-signature` header
- `webhookBody.event` → `event.type`
- `webhookBody.payload.subscription.entity` → `event.data.object`
- `razorpaySubscriptionId` → `stripeSubscriptionId`
- Response: plain text → JSON `{ received: true }`
- **IMPORTANT:** Stripe webhook requires raw body (not JSON parsed). See app.js changes below.

---

### FILE 3: `Server/models/razorpayWebhookModel.js`

**Action:** RENAME → `stripeWebhookModel.js` + MODIFY

**Changes:**
- Rename file to `stripeWebhookModel.js`
- Rename `RazorpayWebhookSchema` → `StripeWebhookSchema`
- Line 23: `razorpaySubscriptionId` → `stripeSubscriptionId`

```js
// Line 23 change:
stripeSubscriptionId: {
  type: String,
  default: null,
},
```

---

### FILE 4: `Server/models/subscriptionModel.js`

**Action:** MODIFY

**Changes:**
- Line 14: `razorpaySubscriptionId` → `stripeSubscriptionId`

```js
// Line 14-18 change:
stripeSubscriptionId: {
  type: String,
  required: true,
  unique: true,
},
```

---

### FILE 5: `Server/routes/webhookRoutes.js`

**Action:** MODIFY

**Current Code:**
```js
import { razorpayWebhookController } from "../controllers/webhookControllers.js";
router.post("/razorpay", razorpayWebhookController)
```

**New Code:**
```js
import { stripeWebhookController } from "../controllers/webhookControllers.js";
router.post("/stripe", stripeWebhookController)
```

**Key Changes:**
- Import `stripeWebhookController` instead of `razorpayWebhookController`
- Route: `/razorpay` → `/stripe`

---

### FILE 6: `Server/controllers/subscriptionControllers.js`

**Action:** MODIFY

**Changes:**
- Line 86: `razorpaySubscriptionId` → `stripeSubscriptionId`

```js
// Line 85-88 change:
const subscription = await Subscription.findOne({
  stripeSubscriptionId: subscriptionId,
  userId,
})
```

---

### FILE 7: `Server/controllers/userControllers.js`

**Action:** MODIFY

**Changes:**
- Line 23: `razorpayMode` → `stripeMode`

```js
// Line 23 change:
stripeMode: process.env.PAYMENT_ENV,
```

---

### FILE 8: `Server/validators/commonValidation.js`

**Action:** MODIFY

**Current Code:**
```js
export const planIdSchema = z
  .string()
  .regex(/^plan_[A-Za-z0-9]{14,20}$/, "Invalid Razorpay plan ID format");
```

**New Code:**
```js
export const planIdSchema = z
  .string()
  .regex(/^price_[A-Za-z0-9]{10,30}$/, "Invalid Stripe price ID format");
```

**Key Changes:**
- Razorpay plan ID format: `^plan_[A-Za-z0-9]{14,20}$`
- Stripe price ID format: `^price_[A-Za-z0-9]{10,30}$`

---

### FILE 9: `Server/services/subscription/createSubscription.js`

**Action:** REWRITE

**Current Code:** Uses `razorpayInstance.subscriptions.create({ plan_id, total_count: 12, notes: { userId } })`

**New Code:**
```js
import { StatusCodes } from "http-status-codes";
import Subscription from "../../models/subscriptionModel.js";
import { getPlanDetailsById } from "../../utils/getPlanDetails.js";
import CustomError from "../../utils/ErrorResponse.js";
import { stripeInstance } from "../stripeService.js";

export default async function createSubscription(userId, priceId) {
  const planDetails = getPlanDetailsById(priceId);

  if (!planDetails) {
    throw new CustomError("Price ID is not valid", StatusCodes.BAD_REQUEST);
  }

  const subscriptionDoc = await Subscription.findOne({ userId });

  if (subscriptionDoc) {
    if (subscriptionDoc.status === "active") {
      throw new CustomError(
        "You already have an active subscription",
        StatusCodes.BAD_REQUEST
      );
    }

    // Same priceId, status is "created" - return existing
    if (
      subscriptionDoc.planId === priceId &&
      subscriptionDoc.status === "created"
    ) {
      const stripeSub = await stripeInstance.subscriptions.retrieve(
        subscriptionDoc.stripeSubscriptionId
      );
      if (stripeSub.status === "incomplete" || stripeSub.status === "trialing") {
        return {
          status: StatusCodes.CREATED,
          message: "Subscription already exists in created status.",
          data: { subscriptionId: subscriptionDoc.stripeSubscriptionId },
        };
      } else {
        throw new CustomError(
          "Subscription is not the same as in Database",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
    }

    // Different priceId selected
    if (subscriptionDoc.planId !== priceId && subscriptionDoc.status === "created") {
      await stripeInstance.subscriptions.cancel(subscriptionDoc.stripeSubscriptionId);

      const subscription = await stripeInstance.subscriptions.create({
        customer: subscriptionDoc.customerId,
        items: [{ price: priceId }],
        metadata: { userId: userId.toString() },
      });

      await Subscription.findByIdAndUpdate(subscriptionDoc._id, {
        planId: priceId,
        stripeSubscriptionId: subscription.id,
      });

      return {
        status: StatusCodes.CREATED,
        message: "Subscription created successfully",
        data: { subscriptionId: subscription.id },
      };
    }
  }

  // Create Stripe Customer first
  const customer = await stripeInstance.customers.create({
    metadata: { userId: userId.toString() },
  });

  // Create subscription with Stripe Checkout
  const session = await stripeInstance.checkout.sessions.create({
    customer: customer.id,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${process.env.CLIENT_URLS.split(",")[0]}/plans?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URLS.split(",")[0]}/plans`,
    metadata: { userId: userId.toString() },
  });

  // Create subscription record in DB (will be activated by webhook)
  const subscription = await Subscription.create({
    planId: priceId,
    userId,
    customerId: customer.id,
    stripeSubscriptionId: null, // Will be set by webhook
    checkoutSessionId: session.id,
    currentPeriodEnd: null,
    currentPeriodStart: null,
    startDate: null,
    endDate: null,
    invoiceId: null,
    status: "created",
  });

  return {
    status: StatusCodes.CREATED,
    message: "Subscription created successfully",
    data: {
      subscriptionId: subscription._id,
      checkoutUrl: session.url,
    },
  };
}
```

**Key Changes:**
- Razorpay creates subscription directly → Stripe requires Customer first, then Checkout Session
- `razorpayInstance.subscriptions.create()` → `stripeInstance.checkout.sessions.create()`
- `total_count: 12` → Stripe handles recurring automatically via Price
- `notes: { userId }` → `metadata: { userId }`
- Returns `checkoutUrl` for redirect instead of Razorpay subscription ID
- New fields needed in Subscription model: `customerId`, `checkoutSessionId`

---

### FILE 10: `Server/services/subscription/cancelSubscription.js`

**Action:** MODIFY

**Current Code:**
```js
await razorpayInstance.subscriptions.cancel(
  subscriptionDoc.razorpaySubscriptionId,
  false
);
```

**New Code:**
```js
await stripeInstance.subscriptions.cancel(
  subscriptionDoc.stripeSubscriptionId
);
```

**Key Changes:**
- `razorpayInstance` → `stripeInstance`
- `razorpaySubscriptionId` → `stripeSubscriptionId`
- Remove second parameter `false` (Stripe cancel is always immediate)

---

### FILE 11: `Server/services/subscription/subscriptionStatus.js`

**Action:** MODIFY

**Changes:**
- Line 82: Replace Razorpay invoice link with Stripe invoice URL

```js
// Line 82 change:
// OLD: invoiceURL: `${process.env.RAZORPAY_INVOICE_LINK}${subscriptionDoc.invoiceId}`,
// NEW:
invoiceURL: `https://invoice.stripe.com/i/${subscriptionDoc.invoiceId}`,
```

---

### FILE 12: `Server/services/subscription/index.js`

**Action:** REWRITE

**Changes:**
- Import `stripeInstance` instead of `razorpayInstance`
- `createRazorpaySubscriptionService` → `createStripeSubscriptionService`
- `razorpayInstance.subscriptions.create()` → `stripeInstance.subscriptions.create()`
- `razorpayInstance.subscriptions.cancel()` → `stripeInstance.subscriptions.cancel()`
- `razorpaySubscriptionId` → `stripeSubscriptionId`
- Add `customerId` to subscription creation

```js
// Line 16-25 change:
export const createStripeSubscriptionService = async (priceId, userId, customerId) => {
  const stripeResponse = await stripeInstance.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    metadata: { userId: userId.toString() },
  });

  return {
    data: stripeResponse?.status === "active" || stripeResponse?.status === "trialing" ? stripeResponse : null,
  };
};

// Line 31-35 change:
export const cancelSubscriptionService = async (subscriptionId) => {
  const stripeResponse = await stripeInstance.subscriptions.cancel(subscriptionId);
  return { success: stripeResponse?.status === "canceled" };
};
```

---

### FILE 13: `Server/services/subscription/changePlan.js`

**Action:** MODIFY (minor - indirect changes through index.js)

**Changes:**
- No direct Razorpay references, but uses `upgradeSubscriptionService` and `downgradeSubscriptionService` which call Stripe services
- Ensure the services it imports use Stripe (handled in index.js changes)

---

### FILE 14: `Server/services/user/index.js`

**Action:** MODIFY

**Changes:**

**Line 16:** Import change
```js
// OLD: import { razorpayInstance } from "../razorpayService.js";
// NEW: import { stripeInstance } from "../stripeService.js";
```

**Lines 126-130 (softDeleteUserService):** Pause subscription
```js
// OLD:
await razorpayInstance.subscriptions.pause(
  user.subscriptionId.razorpaySubscriptionId,
  { pause_at: "now" }
);

// NEW:
await stripeInstance.subscriptions.update(
  user.subscriptionId.stripeSubscriptionId,
  { pause_collection: { behavior: "void" } }
);
```

**Lines 213-216 (recoverUserService):** Resume subscription
```js
// OLD:
await razorpayInstance.subscriptions.resume(
  user.subscriptionId.razorpaySubscriptionId,
  { resume_at: "now" }
);

// NEW:
await stripeInstance.subscriptions.update(
  user.subscriptionId.stripeSubscriptionId,
  { pause_collection: null }
);
```

**Lines 320-323 (disableUserService):** Pause subscription
```js
// Same as softDeleteUserService change above
```

**Lines 350-351 (deleteUserService):** Cancel subscription
```js
// OLD:
await razorpayInstance.subscriptions.cancel(
  user.subscriptionId.razorpaySubscriptionId,
  false
);

// NEW:
await stripeInstance.subscriptions.cancel(
  user.subscriptionId.stripeSubscriptionId
);
```

---

### FILE 15: `Server/services/webhook/index.js`

**Action:** REWRITE

**Current Code:**
```js
async function RazorpayEventHandler(event, webhookBody) {
  switch (event) {
    case "subscription.activated": return handleActivatedEvent(webhookBody);
    case "subscription.cancelled": return handleCancelledEvent(webhookBody);
    case "subscription.charged": return handleChargedEvent(webhookBody);
    case "subscription.pending": return handlePaymentFailureEvent(webhookBody);
    case "subscription.paused": return handlePausedEvent(webhookBody);
    case "subscription.resumed": return handleResumeEvent(webhookBody);
    case "subscription.halted": return handleHaltedEvent(webhookBody);
    default: return `Unhandled event: ${event}`;
  }
}
```

**New Code:**
```js
import handleSubscriptionCreated from "./handleSubscriptionCreated.js";
import handleSubscriptionDeleted from "./handleSubscriptionDeleted.js";
import handleInvoicePaymentSucceeded from "./handleInvoicePaymentSucceeded.js";
import handleInvoicePaymentFailed from "./handleInvoicePaymentFailed.js";
import handleSubscriptionPaused from "./handleSubscriptionPaused.js";
import handleSubscriptionResumed from "./handleSubscriptionResumed.js";

async function StripeEventHandler(eventType, event) {
  switch (eventType) {
    case "customer.subscription.created":
      return handleSubscriptionCreated(event);
    case "customer.subscription.deleted":
      return handleSubscriptionDeleted(event);
    case "invoice.payment_succeeded":
      return handleInvoicePaymentSucceeded(event);
    case "invoice.payment_failed":
      return handleInvoicePaymentFailed(event);
    case "customer.subscription.paused":
      return handleSubscriptionPaused(event);
    case "customer.subscription.resumed":
      return handleSubscriptionResumed(event);
    default:
      return `Unhandled event: ${eventType}`;
  }
}

export default {
  StripeEventHandler
};
```

**Event Mapping:**
| Razorpay Event | Stripe Event |
|----------------|--------------|
| `subscription.activated` | `customer.subscription.created` |
| `subscription.cancelled` | `customer.subscription.deleted` |
| `subscription.charged` | `invoice.payment_succeeded` |
| `subscription.pending` | `invoice.payment_failed` |
| `subscription.paused` | `customer.subscription.paused` |
| `subscription.resumed` | `customer.subscription.resumed` |
| `subscription.halted` | `invoice.payment_failed` (after retries) |

---

### FILE 16: `Server/services/webhook/handleActivatedEvent.js`

**Action:** RENAME → `handleSubscriptionCreated.js` + REWRITE

**New Code:**
```js
import Subscription from "../../models/subscriptionModel.js";
import User from "../../models/userModel.js";
import { getPlanDetailsById } from "../../utils/getPlanDetails.js";
import { sendEventToUser } from "../../controllers/EventController.js";

export default async function handleSubscriptionCreated(event) {
  const subscription = event.data.object;
  const userId = subscription.metadata?.userId;

  if (!userId) {
    return "No userId in subscription metadata, webhook ignored";
  }

  // Find subscription by checkoutSessionId or customerId
  let currentSubscription = await Subscription.findOne({
    customerId: subscription.customer,
    userId,
  });

  if (!currentSubscription) {
    // Try finding by checkout session
    const session = await stripeInstance.checkout.sessions.retrieve(subscription.metadata?.checkoutSessionId);
    currentSubscription = await Subscription.findOne({
      checkoutSessionId: session.id,
      userId,
    });
  }

  if (!currentSubscription) {
    return "No matching subscription found, webhook ignored";
  }

  if (currentSubscription.status === "active") {
    return "Subscription already active — webhook ignored";
  }

  // If status is "pending" (plan change), cancel old subscription
  if (currentSubscription.status === "pending") {
    const oldSubscription = await Subscription.findOne({
      userId,
      status: "active",
    });

    if (oldSubscription) {
      await stripeInstance.subscriptions.cancel(oldSubscription.stripeSubscriptionId);
      await Subscription.deleteOne({ _id: oldSubscription._id });
    }
  }

  // Update subscription document
  const updateSubscriptionDoc = await Subscription.findOneAndUpdate(
    { userId, _id: currentSubscription._id },
    {
      status: "active",
      stripeSubscriptionId: subscription.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      startDate: new Date(subscription.start_date * 1000),
      endDate: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
    },
    { new: true }
  );

  const planDetails = getPlanDetailsById(updateSubscriptionDoc.planId);

  await User.findByIdAndUpdate(userId, {
    maxStorageLimit: planDetails.limits.storageBytes,
    maxFileSize: planDetails.limits.maxFileSizeBytes,
    maxDevices: planDetails.limits.maxDevices,
    subscriptionId: updateSubscriptionDoc._id,
  });

  sendEventToUser(userId, {
    type: "subscriptionActivated",
    plan: planDetails.name,
    message: "Your subscription has been activated!",
  });

  return "Created event handled";
}
```

**Key Changes:**
- `eventBody.payload.subscription.entity` → `event.data.object`
- `webhookSubscription.notes.userId` → `subscription.metadata.userId`
- `webhookSubscription.current_start * 1000` → `new Date(subscription.current_period_start * 1000)`
- `razorpayInstance.subscriptions.cancel()` → `stripeInstance.subscriptions.cancel()`
- `razorpaySubscriptionId` → `stripeSubscriptionId`

---

### FILE 17: `Server/services/webhook/handleCancelledEvent.js`

**Action:** RENAME → `handleSubscriptionDeleted.js` + MODIFY

**Changes:**
- `eventBody.payload.subscription.entity` → `event.data.object`
- `webhookSubscription.notes.userId` → `subscription.metadata.userId`
- `razorpaySubscriptionId` → `stripeSubscriptionId`
- `webhookSubscription.status` → `subscription.status`

```js
// Key field access changes:
const subscription = event.data.object;
const userId = subscription.metadata?.userId;

// Find subscription:
const subscriptionDocument = await Subscription.findOne({
  userId: user._id,
  stripeSubscriptionId: subscription.id,
});
```

---

### FILE 18: `Server/services/webhook/handleChargedEvent.js`

**Action:** RENAME → `handleInvoicePaymentSucceeded.js` + REWRITE

**New Code:**
```js
import Subscription from "../../models/subscriptionModel.js";

export default async function handleInvoicePaymentSucceeded(event) {
  const invoice = event.data.object;
  const subscriptionId = invoice.subscription;

  if (!subscriptionId) {
    return "No subscription on invoice — skipping";
  }

  const subscriptionDoc = await Subscription.findOne({
    stripeSubscriptionId: subscriptionId,
    status: { $in: ["active", "renewal_failed"] },
  });

  if (!subscriptionDoc) {
    return "Subscription not active yet — skipping renewal logic";
  }

  const subscription = await stripeInstance.subscriptions.retrieve(subscriptionId);

  subscriptionDoc.currentPeriodStart = new Date(subscription.current_period_start * 1000);
  subscriptionDoc.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
  subscriptionDoc.invoiceId = invoice.id;
  subscriptionDoc.status = "active";
  await subscriptionDoc.save();

  return "Handled invoice.payment_succeeded — subscription renewed";
}
```

**Key Changes:**
- Razorpay: `eventBody.payload.subscription.entity` + `eventBody.payload.payment.entity.invoice_id`
- Stripe: `event.data.object` (invoice) + `invoice.subscription` + `invoice.id`

---

### FILE 19: `Server/services/webhook/handleHaltedEvent.js`

**Action:** DELETE/MERGE into `handleInvoicePaymentFailed.js`

**Reason:** Stripe doesn't have a direct "halted" event. Failed retries are handled through `invoice.payment_failed` events. The cancellation logic should be merged into the payment failure handler.

---

### FILE 20: `Server/services/webhook/handlePaymentFailureEvent.js`

**Action:** RENAME → `handleInvoicePaymentFailed.js` + MODIFY

**Changes:**
```js
// Key changes:
const invoice = event.data.object;
const subscriptionId = invoice.subscription;

const subscription = await Subscription.findOne({
  stripeSubscriptionId: subscriptionId,
});

// Check if this is the final failure (Stripe retries 3 times automatically)
if (invoice.attempt_count >= 3) {
  // Cancel subscription after max retries
  await stripeInstance.subscriptions.cancel(subscriptionId);
  subscription.status = "renewal_failed";
} else {
  subscription.status = "renewal_failed";
}
await subscription.save();
```

---

### FILE 21: `Server/services/webhook/handlePausedEvent.js`

**Action:** RENAME → `handleSubscriptionPaused.js` + MODIFY

**Changes:**
- `eventBody.payload.subscription.entity` → `event.data.object`
- `webhookSubscription.notes.userId` → `subscription.metadata.userId`

---

### FILE 22: `Server/services/webhook/handleResumeEvent.js`

**Action:** RENAME → `handleSubscriptionResumed.js` + MODIFY

**Changes:**
- `eventBody.payload.subscription.entity` → `event.data.object`
- `webhookSubscription.notes.userId` → `subscription.metadata.userId`

---

### FILE 23: `Server/utils/getPlanDetails.js`

**Action:** MODIFY

**Changes:** Replace all Razorpay plan IDs with Stripe price IDs.

**Current structure:**
```js
const LIVE_PLANS = {
  plan_RWtFksDzZOsg2V: { id: "plan_RWtFksDzZOsg2V", ... },
  plan_RWtGxMLUNKVu35: { id: "plan_RWtGxMLUNKVu35", ... },
  ...
};
```

**New structure:**
```js
const env = process.env.PAYMENT_ENV;

const LIVE_PLANS = {
  [process.env.STRIPE_LIVE_PRICE_PRO_MONTHLY]: {
    id: process.env.STRIPE_LIVE_PRICE_PRO_MONTHLY,
    name: "Pro",
    tagline: "For Students & Freelancers",
    price: 299,
    billingCycle: "monthly",
    features: [...],
    limits: {
      storage: "100 GB",
      storageBytes: 107374182400,
      maxFileSize: "50 GB",
      maxFileSizeBytes: 53687091200,
      maxDevices: 3,
    },
  },
  // ... other plans
};

const TEST_PLANS = {
  [process.env.STRIPE_TEST_PRICE_PRO_MONTHLY]: {
    id: process.env.STRIPE_TEST_PRICE_PRO_MONTHLY,
    name: "Pro",
    ...
  },
  // ... other plans
};

const plans = env === "test" ? TEST_PLANS : LIVE_PLANS;
```

---

### FILE 24: `Server/app.js` (IMPORTANT - Webhook Raw Body)

**Action:** ADD raw body handling for Stripe webhook

**Add before webhook routes:**
```js
// Stripe webhook needs raw body for signature verification
// This must be BEFORE the JSON body parser for the webhook route
app.use("/webhook/stripe", express.raw({ type: "application/json" }));
```

**Or use a separate router with raw body:**
```js
// In webhookRoutes.js:
import express from "express";
import { stripeWebhookController } from "../controllers/webhookControllers.js";

const router = express.Router();

// Stripe webhook requires raw body for signature verification
const stripeRouter = express.Router();
stripeRouter.post("/stripe", express.raw({ type: "application/json" }), stripeWebhookController);

router.use(stripeRouter);

export default router;
```

---

## 6. Client-Side File Changes (4 Files)

### FILE 1: `Client/src/Utils/openRazorpayPopup.js`

**Action:** REWRITE → Rename to `openStripeCheckout.js`

**Current Code:** Opens Razorpay Checkout modal with `new Razorpay({ ... })`

**New Code:**
```js
import { toast } from "sonner";

export function openStripeCheckout({ checkoutUrl, userId }) {
  let waitingToastId = null;
  const eventSource = new EventSource(
    `${import.meta.env.VITE_BACKEND_URL}/events?userId=${userId}`
  );

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "subscriptionActivated") {
      if (waitingToastId) toast.dismiss(waitingToastId);
      toast.success("Your subscription is now active!", {
        description: `You now have access to ${data.plan} features`,
        duration: 5000,
        action: {
          label: "View Details",
          onClick: () => (window.location.href = "/plans"),
        },
        style: {
          background: "#ffffff",
          color: "#065f46",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          boxShadow:
            "0 10px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)",
          padding: "20px",
          fontWeight: "500",
        },
      });
      eventSource.close();
    }
  };

  eventSource.onerror = (err) => {
    console.error("SSE error:", err);
    if (waitingToastId) toast.dismiss(waitingToastId);
    eventSource.close();
  };

  waitingToastId = toast.loading("Redirecting to secure payment...", {
    description: "Please wait while we redirect you to Stripe",
    style: {
      background: "#ffffff",
      color: "#1e40af",
      border: "1px solid #e5e7eb",
      borderRadius: "16px",
      boxShadow:
        "0 10px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)",
      padding: "20px",
      fontWeight: "500",
    },
  });

  // Redirect to Stripe Checkout
  window.location.href = checkoutUrl;
}
```

**Key Changes:**
- No Razorpay SDK needed (Stripe Checkout is a redirect, not an embedded modal)
- `subscriptionId` → `checkoutUrl` (Stripe Checkout URL)
- `rzp.open()` → `window.location.href = checkoutUrl`
- SSE event listener remains the same (backend sends the same event)

---

### FILE 2: `Client/src/Pages/SubscriptionPage/Plans.jsx`

**Action:** MODIFY

**Changes:**

**Line 139:**
```js
// OLD: const razorpayMode = user?.razorpayMode;
// NEW:
const stripeMode = user?.stripeMode;
```

**Lines 29-30, 49-50, 90-91, 112-113:** Replace plan IDs with Stripe price IDs

```js
// OLD:
id: {
  test: "plan_Ra0GqWQ6p0ffYM",
  live: "plan_RWtFksDzZOsg2V",
},

// NEW (use your actual Stripe price IDs):
id: {
  test: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY_TEST,
  live: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY_LIVE,
},
```

**All occurrences of `razorpayMode` → `stripeMode`:**
- Line 139: `const stripeMode = user?.stripeMode;`
- Line 212: `key={plan.id[stripeMode]}`
- Line 302: `onClick={() => handleSubmit(plan.id[stripeMode])}`

**Line 144-148:** Handle new response format (checkoutUrl instead of subscriptionId)
```js
// OLD:
const res = await handleCreateSubscription(planId);
const subscriptionId = res.data.subscriptionId;
const url = `https://payments.kunalkhandekar.me?subscriptionId=${subscriptionId}&userId=${user._id}`;
setRedirectUrl(url);

// NEW:
const res = await handleCreateSubscription(planId);
const checkoutUrl = res.data.checkoutUrl;
setRedirectUrl(checkoutUrl);
```

**Also add Client environment variables (.env.local):**
```env
VITE_STRIPE_PRICE_PRO_MONTHLY_TEST=""
VITE_STRIPE_PRICE_PRO_YEARLY_TEST=""
VITE_STRIPE_PRICE_PREMIUM_MONTHLY_TEST=""
VITE_STRIPE_PRICE_PREMIUM_YEARLY_TEST=""
VITE_STRIPE_PUBLISHABLE_KEY_TEST=""
```

---

### FILE 3: `Client/src/Pages/SubscriptionPage/RenewalFailed.jsx`

**Action:** MODIFY

**Line 21:** Update text
```jsx
// OLD:
Razorpay will automatically retry the payment up to{" "}
<span className="font-medium">3 times</span>.

// NEW:
Stripe will automatically retry the payment up to{" "}
<span className="font-medium">3 times</span>.
```

---

### FILE 4: `Client/src/Pages/SubscriptionPage/changePlanPage/PlanEligibleForSwtich.jsx`

**Action:** MODIFY

**Line 14:**
```js
// OLD: const razorpayMode = user?.razorpayMode;
// NEW:
const stripeMode = user?.stripeMode;
```

**All occurrences of `razorpayMode` → `stripeMode`:**
- Line 31: `plansEligible.includes(plan.id[stripeMode])`
- Line 65: `key={plan.id[stripeMode]}`
- Line 112: `onClick={() => handleChangePlan(plan.id[stripeMode])}`

---

## 7. Razorpay vs Stripe API Mapping

### Subscription Operations

| Operation | Razorpay | Stripe |
|-----------|----------|--------|
| **Create** | `razorpayInstance.subscriptions.create({ plan_id, total_count: 12, notes: { userId } })` | `stripeInstance.checkout.sessions.create({ customer, line_items: [{ price }], mode: 'subscription' })` |
| **Retrieve** | `razorpayInstance.subscriptions.fetch(id)` | `stripeInstance.subscriptions.retrieve(id)` |
| **Cancel** | `razorpayInstance.subscriptions.cancel(id, false)` | `stripeInstance.subscriptions.cancel(id)` |
| **Pause** | `razorpayInstance.subscriptions.pause(id, { pause_at: 'now' })` | `stripeInstance.subscriptions.update(id, { pause_collection: { behavior: 'void' } })` |
| **Resume** | `razorpayInstance.subscriptions.resume(id, { resume_at: 'now' })` | `stripeInstance.subscriptions.update(id, { pause_collection: null })` |
| **Update** | N/A (create new) | `stripeInstance.subscriptions.update(id, { items: [{ price: newPriceId }] })` |

### Webhook Verification

| Aspect | Razorpay | Stripe |
|--------|----------|--------|
| **Method** | `validateWebhookSignature(body, signature, secret)` | `stripe.webhooks.constructEvent(body, sig, secret)` |
| **Header** | `x-razorpay-signature` | `stripe-signature` |
| **Body Format** | JSON parsed | Raw buffer |
| **Event Type** | `webhookBody.event` | `event.type` |
| **Payload** | `webhookBody.payload.subscription.entity` | `event.data.object` |
| **User ID** | `payload.subscription.entity.notes.userId` | `data.object.metadata.userId` |

### Subscription Status Mapping

| Razorpay Status | Stripe Status |
|-----------------|---------------|
| `created` | `incomplete` / `incomplete_expired` |
| `active` | `active` / `trialing` |
| `past_due` | `past_due` |
| `paused` | `paused` |
| `cancelled` | `canceled` |
| `pending` | `incomplete` |
| `renewal_failed` | `past_due` |

---

## 8. Webhook Events Mapping

### Events to Listen For in Stripe

| # | Stripe Event | What It Triggers | Handler File |
|---|--------------|------------------|--------------|
| 1 | `customer.subscription.created` | New subscription activated | `handleSubscriptionCreated.js` |
| 2 | `customer.subscription.deleted` | Subscription cancelled | `handleSubscriptionDeleted.js` |
| 3 | `customer.subscription.updated` | Plan changed, paused, resumed | (handle in specific handlers) |
| 4 | `customer.subscription.paused` | User paused (admin action) | `handleSubscriptionPaused.js` |
| 5 | `customer.subscription.resumed` | User resumed (admin action) | `handleSubscriptionResumed.js` |
| 6 | `invoice.payment_succeeded` | Renewal payment successful | `handleInvoicePaymentSucceeded.js` |
| 7 | `invoice.payment_failed` | Renewal payment failed | `handleInvoicePaymentFailed.js` |

### Webhook Configuration in Stripe Dashboard

```
Endpoint URL: https://your-domain.com/webhook/stripe
API Version: 2025-01-27.acacia (or latest)
Events:
  ✓ customer.subscription.created
  ✓ customer.subscription.deleted
  ✓ customer.subscription.paused
  ✓ customer.subscription.resumed
  ✓ customer.subscription.updated
  ✓ invoice.payment_succeeded
  ✓ invoice.payment_failed
```

---

## 9. Step-by-Step Migration Order

### Phase 1: Setup (Day 1)
1. [ ] Create Stripe account
2. [ ] Create Products & Prices in Stripe Dashboard (test mode)
3. [ ] Copy Stripe API keys
4. [ ] Update `.env` and `.env.local` with Stripe credentials
5. [ ] Install Stripe package: `npm install stripe`
6. [ ] Uninstall Razorpay: `npm uninstall razorpay`

### Phase 2: Server Core (Day 1-2)
7. [ ] Rewrite `services/razorpayService.js` → `services/stripeService.js`
8. [ ] Update `models/subscriptionModel.js` (razorpaySubscriptionId → stripeSubscriptionId, add customerId, checkoutSessionId)
9. [ ] Rename + update `models/razorpayWebhookModel.js` → `stripeWebhookModel.js`
10. [ ] Update `validators/commonValidation.js` (plan ID regex)
11. [ ] Update `utils/getPlanDetails.js` (replace plan IDs with Stripe price IDs)

### Phase 3: Subscription Services (Day 2)
12. [ ] Rewrite `services/subscription/createSubscription.js` (Stripe Checkout flow)
13. [ ] Update `services/subscription/cancelSubscription.js`
14. [ ] Update `services/subscription/subscriptionStatus.js` (invoice URL)
15. [ ] Rewrite `services/subscription/index.js` (Stripe service functions)
16. [ ] Update `services/subscription/changePlan.js` (indirect)

### Phase 4: Webhooks (Day 2-3)
17. [ ] Rewrite `controllers/webhookControllers.js` (Stripe signature verification)
18. [ ] Update `routes/webhookRoutes.js` (/razorpay → /stripe, raw body handling)
19. [ ] Rewrite `services/webhook/index.js` (StripeEventHandler)
20. [ ] Rename + rewrite all webhook handlers:
    - `handleActivatedEvent.js` → `handleSubscriptionCreated.js`
    - `handleCancelledEvent.js` → `handleSubscriptionDeleted.js`
    - `handleChargedEvent.js` → `handleInvoicePaymentSucceeded.js`
    - `handlePaymentFailureEvent.js` → `handleInvoicePaymentFailed.js`
    - `handlePausedEvent.js` → `handleSubscriptionPaused.js`
    - `handleResumeEvent.js` → `handleSubscriptionResumed.js`
    - Delete `handleHaltedEvent.js` (merge into payment failed)
21. [ ] Configure webhook endpoint in Stripe Dashboard

### Phase 5: User Services (Day 3)
22. [ ] Update `services/user/index.js` (pause/resume/cancel with Stripe API)
23. [ ] Update `controllers/userControllers.js` (razorpayMode → stripeMode)
24. [ ] Update `controllers/subscriptionControllers.js` (stripeSubscriptionId)

### Phase 6: Client (Day 3-4)
25. [ ] Rewrite `openRazorpayPopup.js` → `openStripeCheckout.js`
26. [ ] Update `Plans.jsx` (plan IDs → price IDs, razorpayMode → stripeMode)
27. [ ] Update `RenewalFailed.jsx` (text change)
28. [ ] Update `PlanEligibleForSwtich.jsx` (razorpayMode → stripeMode)
29. [ ] Add Stripe environment variables to Client `.env.local`

### Phase 7: Testing (Day 4-5)
30. [ ] Test subscription creation flow
31. [ ] Test Stripe Checkout redirect
32. [ ] Test webhook receiving and processing
33. [ ] Test subscription cancellation
34. [ ] Test plan switching (upgrade/downgrade)
35. [ ] Test user soft-delete (pause) and recovery (resume)
36. [ ] Test payment failure handling
37. [ ] Test SSE events reaching frontend

---

## 10. Stripe Products & Prices Setup

### Create These in Stripe Dashboard (Test Mode First)

#### Product: "Pro Plan"
| Billing | Amount | Currency | Price ID (fill after creation) |
|---------|--------|----------|-------------------------------|
| Monthly | ₹299 | INR | `STRIPE_TEST_PRICE_PRO_MONTHLY` |
| Yearly | ₹2,999 | INR | `STRIPE_TEST_PRICE_PRO_YEARLY` |

#### Product: "Premium Plan"
| Billing | Amount | Currency | Price ID (fill after creation) |
|---------|--------|----------|-------------------------------|
| Monthly | ₹699 | INR | `STRIPE_TEST_PRICE_PREMIUM_MONTHLY` |
| Yearly | ₹6,999 | INR | `STRIPE_TEST_PRICE_PREMIUM_YEARLY` |

### Environment Variables Template

**Server `.env`:**
```env
STRIPE_TEST_SECRET_KEY="sk_test_..."
STRIPE_TEST_PUBLISHABLE_KEY="pk_test_..."
STRIPE_TEST_PRICE_PRO_MONTHLY="price_..."
STRIPE_TEST_PRICE_PRO_YEARLY="price_..."
STRIPE_TEST_PRICE_PREMIUM_MONTHLY="price_..."
STRIPE_TEST_PRICE_PREMIUM_YEARLY="price_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
PAYMENT_ENV="test"
```

**Client `.env.local`:**
```env
VITE_STRIPE_PRICE_PRO_MONTHLY_TEST="price_..."
VITE_STRIPE_PRICE_PRO_YEARLY_TEST="price_..."
VITE_STRIPE_PRICE_PREMIUM_MONTHLY_TEST="price_..."
VITE_STRIPE_PRICE_PREMIUM_YEARLY_TEST="price_..."
```

---

## 11. Testing Checklist

### Subscription Creation
- [ ] Click "Subscribe Now" on a plan
- [ ] Redirect to Stripe Checkout page
- [ ] Complete test payment (use Stripe test card: `4242 4242 4242 4242`)
- [ ] Webhook received and processed
- [ ] Subscription status changes to "active"
- [ ] User storage limits updated
- [ ] SSE event received on frontend
- [ ] Success toast displayed

### Subscription Cancellation
- [ ] Cancel subscription from UI
- [ ] Stripe subscription cancelled
- [ ] Webhook received (`customer.subscription.deleted`)
- [ ] User reverted to free plan limits
- [ ] Subscription record deleted from DB

### Plan Switching
- [ ] Switch from Pro to Premium (upgrade)
- [ ] New checkout session created
- [ ] Payment completed
- [ ] Old subscription cancelled
- [ ] New subscription activated
- [ ] Storage limits updated

### Payment Failure
- [ ] Use Stripe test card that declines (`4000 0000 0000 0002`)
- [ ] `invoice.payment_failed` webhook received
- [ ] Subscription status set to `renewal_failed`
- [ ] RenewalFailed page displayed

### User Lifecycle
- [ ] Soft delete user → subscription paused
- [ ] Recover user → subscription resumed
- [ ] Delete user → subscription cancelled + all data removed

### Webhook Security
- [ ] Invalid webhook signature rejected (400 error)
- [ ] Duplicate webhooks handled (idempotency)
- [ ] Webhook logged in database

---

## Additional Notes

### What Stays the Same
- API endpoint structure (`/subscription/create`, `/subscription/status`, etc.)
- Subscription model status enum (keep same values)
- SSE event system for real-time updates
- Toast notification system
- Plan details structure (name, price, features, limits)
- User storage limit management
- Cron job for cleaning pending subscriptions (no changes needed)

### What Changes
- Payment processor: Razorpay → Stripe
- Payment flow: Embedded modal → Redirect to Stripe Checkout
- Plan IDs: `plan_xxx` → `price_xxx`
- Customer management: Implicit (notes) → Explicit (Stripe Customer object)
- Webhook signature validation method
- Webhook event names
- Webhook route: `/webhook/razorpay` → `/webhook/stripe`
- Invoice URL format

### New Fields Needed in Subscription Model
Add these to `Server/models/subscriptionModel.js`:
```js
customerId: {
  type: String,
  default: null,
},
checkoutSessionId: {
  type: String,
  default: null,
},
```

### Stripe Test Cards
| Card Number | Behavior |
|-------------|----------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Decline |
| `4000 0000 0000 0069` | Expired card |
| `4000 0000 0000 0077` | Insufficient funds |
| `4000 0000 0000 0101` | Requires authentication (3D Secure) |

Use any future expiry date and any 3-digit CVC for testing.

---

## File Summary

### Files to CREATE (new files)
1. `Server/services/stripeService.js` (replace razorpayService.js)
2. `Server/services/webhook/handleSubscriptionCreated.js` (replace handleActivatedEvent.js)
3. `Server/services/webhook/handleSubscriptionDeleted.js` (replace handleCancelledEvent.js)
4. `Server/services/webhook/handleInvoicePaymentSucceeded.js` (replace handleChargedEvent.js)
5. `Server/services/webhook/handleInvoicePaymentFailed.js` (replace handlePaymentFailureEvent.js + handleHaltedEvent.js)
6. `Server/services/webhook/handleSubscriptionPaused.js` (replace handlePausedEvent.js)
7. `Server/services/webhook/handleSubscriptionResumed.js` (replace handleResumeEvent.js)
8. `Client/src/Utils/openStripeCheckout.js` (replace openRazorpayPopup.js)

### Files to MODIFY
1. `Server/models/subscriptionModel.js`
2. `Server/models/razorpayWebhookModel.js` (rename to stripeWebhookModel.js)
3. `Server/controllers/webhookControllers.js`
4. `Server/controllers/subscriptionControllers.js`
5. `Server/controllers/userControllers.js`
6. `Server/validators/commonValidation.js`
7. `Server/routes/webhookRoutes.js`
8. `Server/services/subscription/createSubscription.js`
9. `Server/services/subscription/cancelSubscription.js`
10. `Server/services/subscription/subscriptionStatus.js`
11. `Server/services/subscription/index.js`
12. `Server/services/subscription/changePlan.js`
13. `Server/services/user/index.js`
14. `Server/services/webhook/index.js`
15. `Server/utils/getPlanDetails.js`
16. `Server/app.js` (raw body for webhook)
17. `Client/src/Pages/SubscriptionPage/Plans.jsx`
18. `Client/src/Pages/SubscriptionPage/RenewalFailed.jsx`
19. `Client/src/Pages/SubscriptionPage/changePlanPage/PlanEligibleForSwtich.jsx`

### Files to DELETE
1. `Server/services/razorpayService.js`
2. `Server/services/webhook/handleActivatedEvent.js`
3. `Server/services/webhook/handleCancelledEvent.js`
4. `Server/services/webhook/handleChargedEvent.js`
5. `Server/services/webhook/handlePaymentFailureEvent.js`
6. `Server/services/webhook/handlePausedEvent.js`
7. `Server/services/webhook/handleResumeEvent.js`
8. `Server/services/webhook/handleHaltedEvent.js`
9. `Client/src/Utils/openRazorpayPopup.js`

### Environment Files to MODIFY
1. `Server/.env`
2. `Server/.env.local`
3. `Client/.env.local` (add Stripe price IDs)

---

**Total Impact:**
- **Server:** 18 files modified, 8 new files, 9 files deleted
- **Client:** 4 files modified, 1 new file, 1 file deleted
- **Environment:** 3 files modified
- **Packages:** 1 added (stripe), 1 removed (razorpay)
