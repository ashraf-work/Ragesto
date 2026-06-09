const PLANS = {
  "pro-monthly": {
    id: "pro-monthly",
    stripePriceEnv: "STRIPE_PRICE_PRO_MONTHLY",
    name: "Pro",
    tagline: "For Students & Freelancers",
    price: 299,
    billingCycle: "monthly",
    features: [
      "100 GB secure storage",
      "File upload limit: 50 GB per file",
      "Access from up to 3 devices",
      "Priority upload/download speed",
      "Email & chat support",
    ],
    limits: {
      storage: "100 GB",
      storageBytes: 107374182400,
      maxFileSize: "50 GB",
      maxFileSizeBytes: 53687091200,
      maxDevices: 3,
    },
  },

  "premium-monthly": {
    id: "premium-monthly",
    stripePriceEnv: "STRIPE_PRICE_PREMIUM_MONTHLY",
    name: "Premium",
    tagline: "For Professionals & Creators",
    price: 699,
    billingCycle: "monthly",
    features: [
      "250 GB secure storage",
      "File upload limit: 100 GB per file",
      "Access from up to 3 devices",
      "Priority upload/download speed",
      "Priority customer support",
    ],
    limits: {
      storage: "250 GB",
      storageBytes: 268435456000,
      maxFileSize: "100 GB",
      maxFileSizeBytes: 107374182400,
      maxDevices: 3,
    },
  },

  "pro-yearly": {
    id: "pro-yearly",
    stripePriceEnv: "STRIPE_PRICE_PRO_YEARLY",
    name: "Pro",
    tagline: "For Students & Freelancers",
    price: 2999,
    billingCycle: "yearly",
    features: [
      "200 GB secure storage",
      "File upload limit: 2 GB per file",
      "Access from up to 3 devices",
      "Priority upload/download speed",
      "Email & chat support",
    ],
    limits: {
      storage: "200 GB",
      storageBytes: 214748364800,
      maxFileSize: "2 GB",
      maxFileSizeBytes: 2147483648,
      maxDevices: 3,
    },
  },

  "premium-yearly": {
    id: "premium-yearly",
    stripePriceEnv: "STRIPE_PRICE_PREMIUM_YEARLY",
    name: "Premium",
    tagline: "For Professionals & Creators",
    price: 6999,
    billingCycle: "yearly",
    features: [
      "2 TB secure storage",
      "File upload limit: 10 GB per file",
      "Access from up to 3 devices",
      "Priority upload/download speed",
      "Priority customer support",
    ],
    limits: {
      storage: "2 TB",
      storageBytes: 2199023255552,
      maxFileSize: "10 GB",
      maxFileSizeBytes: 10737418240,
      maxDevices: 3,
    },
  },
};

export const getPlanDetailsById = (planId) => {
  if (planId === "default") {
    return {
      id: "default",
      name: "Free",
      limits: {
        storage: "500 MB",
        storageBytes: 524288000,
        maxFileSize: "100 MB",
        maxFileSizeBytes: 104857600,
        maxDevices: 1,
      },
    };
  }

  return PLANS[planId] || null;
};

export const getPlansEligibleForChange = (activePlanId) => {
  return Object.keys(PLANS).filter((planId) => planId !== activePlanId);
};
