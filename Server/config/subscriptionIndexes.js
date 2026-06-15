import mongoose from "mongoose";

const SUBSCRIPTION_INDEXES = [
  {
    key: { stripeSubscriptionId: 1 },
    options: {
      unique: true,
      name: "stripeSubscriptionId_unique_string",
      partialFilterExpression: { stripeSubscriptionId: { $type: "string" } },
    },
  },
  {
    key: { stripeCheckoutSessionId: 1 },
    options: {
      unique: true,
      name: "stripeCheckoutSessionId_unique_string",
      partialFilterExpression: {
        stripeCheckoutSessionId: { $type: "string" },
      },
    },
  },
];

function isObsoletePaymentIndex(index) {
  const indexFields = Object.keys(index.key || {});
  const hasRazorpayField = indexFields.some((field) =>
    field.toLowerCase().startsWith("razorpay"),
  );
  const isOldStripeOptionalIndex = [
    "stripeSubscriptionId_1",
    "stripeCheckoutSessionId_1",
  ].includes(index.name);

  return hasRazorpayField || isOldStripeOptionalIndex;
}

export async function ensureSubscriptionIndexes() {
  const db = mongoose.connection.db;
  if (!db) return;

  const collections = await db
    .listCollections({ name: "subscriptions" })
    .toArray();

  if (collections.length === 0) return;

  const collection = db.collection("subscriptions");
  const indexes = await collection.indexes();

  for (const index of indexes) {
    if (index.name !== "_id_" && isObsoletePaymentIndex(index)) {
      await collection.dropIndex(index.name);
      console.log(`Dropped obsolete subscription index: ${index.name}`);
    }
  }

  for (const { key, options } of SUBSCRIPTION_INDEXES) {
    await collection.createIndex(key, options);
  }
}
