import {
  Check,
  Crown,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { handleCreateSubscription } from "../../Apis/subscriptionApi";
import { toast } from "sonner";
import { redirectToStripeCheckout } from "../../Utils/stripeCheckout";

export const monthlyPlans = [
  {
    id: { value: "free-monthly" },
    name: "Free",
    tagline: "Starter",
    bestFor: "Personal users who want to try the platform",
    billingCycle: "Month",
    price: 0,
    icon: Sparkles,
    features: [
      "500 MB secure storage",
      "Up to 100 MB per file",
      "Access from 1 device",
      "Standard download speed",
      "Basic email support",
    ],
  },
  {
    id: { value: "pro-monthly" },
    name: "Pro",
    billingCycle: "Month",
    tagline: "For students & freelancers",
    bestFor: "Students, freelancers, or small teams who need more space",
    price: 299,
    icon: Zap,
    features: [
      "100 GB secure storage",
      "Up to 50 GB per file",
      "Access from 3 devices",
      "Priority upload/download",
      "Email & chat support",
    ],
    popular: true,
  },
  {
    id: { value: "premium-monthly" },
    name: "Premium",
    billingCycle: "Month",
    tagline: "For professionals & creators",
    bestFor: "Professionals and creators handling large media files",
    price: 699,
    icon: Crown,
    features: [
      "250 GB secure storage",
      "Up to 100 GB per file",
      "Access from 3 devices",
      "Priority upload/download",
      "Priority customer support",
    ],
  },
];

export const yearlyPlans = [
  {
    id: { value: "free-yearly" },
    name: "Free",
    billingCycle: "Year",
    tagline: "Starter",
    bestFor: "Personal users who want to try the platform",
    price: 0,
    icon: Sparkles,
    features: [
      "500 MB secure storage",
      "Up to 100 MB per file",
      "Access from 1 device",
      "Standard download speed",
      "Basic email support",
    ],
  },
  {
    id: { value: "pro-yearly" },
    name: "Pro",
    billingCycle: "Year",
    tagline: "For students & freelancers",
    bestFor: "Students, freelancers, or small teams who need more space",
    price: 2999,
    monthlyEquivalent: 249,
    originalMonthly: 299,
    icon: Zap,
    features: [
      "200 GB secure storage",
      "Up to 2 GB per file",
      "Access from 3 devices",
      "Priority upload/download",
      "Email & chat support",
    ],
    popular: true,
  },
  {
    id: { value: "premium-yearly" },
    name: "Premium",
    billingCycle: "Year",
    tagline: "For professionals & creators",
    bestFor: "Professionals and creators handling large media files",
    price: 6999,
    monthlyEquivalent: 583,
    originalMonthly: 699,
    icon: Crown,
    features: [
      "2 TB secure storage",
      "Up to 10 GB per file",
      "Access from 3 devices",
      "Priority upload/download",
      "Priority customer support",
    ],
  },
];

const trustItems = [
  { icon: ShieldCheck, label: "256-bit encryption" },
  { icon: Lock, label: "GDPR & SOC 2 ready" },
  { icon: Sparkles, label: "Cancel anytime" },
];

const Plans = ({ hasActivePlan }) => {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [loadingPlanId, setLoadingPlanId] = useState(null);

  const handleSubmit = async (planId) => {
    setLoadingPlanId(planId);
    try {
      const res = await handleCreateSubscription(planId);
      if (!res?.success) {
        toast.error(res?.message || "Unable to start Stripe checkout");
        return;
      }
      redirectToStripeCheckout({ checkoutUrl: res.data.checkoutUrl });
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error(error?.message || "Unable to start Stripe checkout");
    } finally {
      setLoadingPlanId(null);
    }
  };

  const currentPlans = billingCycle === "monthly" ? monthlyPlans : yearlyPlans;
  const isYearly = billingCycle === "yearly";

  return (
    <div className="min-h-screen py-10 sm:py-14 px-4 sm:px-6 lg:px-8" data-testid="plans-page">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-10 sm:mb-12 animate-fade-up">
          <span className="inline-flex items-center gap-2 chip chip-brand mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Ragesto plans
          </span>
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-3 max-w-2xl mx-auto"
            style={{ letterSpacing: "-0.025em" }}
          >
            Storage that{" "}
            <span className="text-gradient-brand">grows with you</span>
          </h1>
          <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-xl mx-auto">
            Clear limits, secure sharing, and predictable billing for personal
            files, freelancers, and creators.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-10" data-testid="plans-billing-toggle">
          <div className="relative inline-flex p-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            <button
              onClick={() => setBillingCycle("monthly")}
              data-testid="billing-monthly"
              className={`relative px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                billingCycle === "monthly"
                  ? "text-white"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {billingCycle === "monthly" && (
                <span
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #4338ca)",
                  }}
                />
              )}
              <span className="relative">Monthly</span>
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              data-testid="billing-yearly"
              className={`relative inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                billingCycle === "yearly"
                  ? "text-white"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {billingCycle === "yearly" && (
                <span
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #4338ca)",
                  }}
                />
              )}
              <span className="relative">Yearly</span>
              <span
                className={`relative chip text-[10px] !py-0 !px-1.5 ${
                  billingCycle === "yearly"
                    ? "bg-white/20 !text-white !border-white/20"
                    : "chip-success"
                }`}
              >
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 mb-10">
          {currentPlans.map((plan) => {
            const Icon = plan.icon;
            const isFreePlan = plan.price === 0;
            const isCurrentPlan = !hasActivePlan && isFreePlan;
            const isPopular = plan.popular;
            const isLoading = loadingPlanId === plan.id.value;

            return (
              <div
                key={plan.id.value}
                data-testid={`plan-card-${plan.name.toLowerCase()}`}
                className={`relative rounded-2xl overflow-hidden flex flex-col transition-all duration-300 animate-fade-up ${
                  isPopular
                    ? "shadow-[0_24px_60px_-20px_rgba(79,70,229,0.5)] -translate-y-1 hover:-translate-y-2"
                    : "shadow-sm hover:-translate-y-1"
                }`}
                style={{
                  background: isPopular
                    ? "linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)"
                    : "var(--surface)",
                  border: isPopular
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "1px solid var(--border)",
                }}
              >
                {/* Popular ribbon */}
                {isPopular && (
                  <div className="absolute top-0 inset-x-0 flex justify-center">
                    <div
                      className="px-3 py-1 text-[10px] font-bold tracking-[0.18em] uppercase rounded-b-lg text-white"
                      style={{
                        background: "linear-gradient(90deg, #06b6d4, #a78bfa)",
                      }}
                    >
                      Most popular
                    </div>
                  </div>
                )}
                {isCurrentPlan && !isPopular && (
                  <div className="absolute top-3 right-3">
                    <span className="chip chip-success inline-flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Current
                    </span>
                  </div>
                )}

                <div className="p-6 sm:p-7 flex-1 flex flex-col">
                  {/* Plan header */}
                  <div className="mb-5">
                    <div
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 ${
                        isPopular ? "" : "bg-[var(--primary-soft)]"
                      }`}
                      style={
                        isPopular
                          ? {
                              background:
                                "linear-gradient(135deg, rgba(6,182,212,0.25), rgba(167,139,250,0.25))",
                              border: "1px solid rgba(255,255,255,0.12)",
                            }
                          : undefined
                      }
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          isPopular ? "text-cyan-300" : "text-[var(--primary)]"
                        }`}
                      />
                    </div>
                    <h3
                      className={`text-2xl font-bold ${
                        isPopular ? "text-white" : "text-[var(--text-primary)]"
                      }`}
                      style={{ letterSpacing: "-0.02em" }}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={`mt-1 text-xs font-semibold ${
                        isPopular ? "text-cyan-300" : "text-[var(--primary)]"
                      }`}
                    >
                      {plan.tagline}
                    </p>
                    <p
                      className={`mt-2 text-sm leading-relaxed ${
                        isPopular ? "text-white/70" : "text-[var(--text-muted)]"
                      }`}
                    >
                      {plan.bestFor}
                    </p>
                  </div>

                  {/* Price */}
                  <div
                    className={`mb-6 pb-6 border-b ${
                      isPopular ? "border-white/10" : "border-[var(--border)]"
                    }`}
                  >
                    {plan.price === 0 ? (
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`text-4xl font-bold ${
                            isPopular ? "text-white" : "text-[var(--text-primary)]"
                          }`}
                        >
                          Free
                        </span>
                        <span
                          className={`text-sm ${
                            isPopular ? "text-white/60" : "text-[var(--text-subtle)]"
                          }`}
                        >
                          forever
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span
                            className={`text-4xl font-bold ${
                              isPopular
                                ? "text-white"
                                : "text-[var(--text-primary)]"
                            }`}
                          >
                            ${isYearly ? plan.monthlyEquivalent : plan.price}
                          </span>
                          <span
                            className={`text-sm ${
                              isPopular
                                ? "text-white/60"
                                : "text-[var(--text-muted)]"
                            }`}
                          >
                            /month
                          </span>
                        </div>
                        {isYearly && (
                          <div className="mt-2 flex items-center gap-2 text-xs">
                            <span
                              className={
                                isPopular ? "text-white/60" : "text-[var(--text-muted)]"
                              }
                            >
                              Billed ${plan.price}/year
                            </span>
                            <span
                              className={`chip !py-0 !px-1.5 text-[10px] ${
                                isPopular
                                  ? "bg-white/15 !text-white !border-white/15"
                                  : "chip-success"
                              }`}
                            >
                              Save ${plan.originalMonthly * 12 - plan.price}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleSubmit(plan.id.value)}
                    disabled={isLoading || isCurrentPlan}
                    data-testid={`plan-cta-${plan.name.toLowerCase()}`}
                    className={`w-full py-3 px-5 rounded-xl font-semibold text-sm transition-all duration-200 mb-6 ${
                      isCurrentPlan
                        ? isPopular
                          ? "bg-white/15 text-white cursor-default"
                          : "bg-[var(--success-soft)] text-[var(--success-strong)] cursor-default"
                        : isPopular
                        ? "bg-white text-[var(--primary-strong)] hover:bg-white/95 shadow-[0_10px_30px_-10px_rgba(255,255,255,0.4)]"
                        : "premium-button-primary"
                    } ${isLoading && "opacity-60 cursor-not-allowed"}`}
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </span>
                    ) : isCurrentPlan ? (
                      <span className="inline-flex items-center justify-center gap-1.5">
                        <Check className="w-4 h-4" />
                        Current plan
                      </span>
                    ) : plan.price === 0 ? (
                      "Get started"
                    ) : (
                      "Get " + plan.name
                    )}
                  </button>

                  {/* Features */}
                  <p
                    className={`text-[11px] font-bold uppercase tracking-[0.12em] mb-3 ${
                      isPopular ? "text-white/50" : "text-[var(--text-subtle)]"
                    }`}
                  >
                    What's included
                  </p>
                  <div className="space-y-2.5 flex-1">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <div
                          className={`flex-shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                            isPopular
                              ? "bg-cyan-400/20 text-cyan-300"
                              : "bg-[var(--success-soft)] text-[var(--success)]"
                          }`}
                        >
                          <Check className="w-2.5 h-2.5" strokeWidth={3} />
                        </div>
                        <span
                          className={`text-sm leading-snug ${
                            isPopular
                              ? "text-white/85"
                              : "text-[var(--text-secondary)]"
                          }`}
                        >
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mb-6 text-sm">
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-2 text-[var(--text-muted)]"
              >
                <Icon className="w-4 h-4 text-[var(--success)]" />
                <span className="font-medium">{item.label}</span>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-[var(--text-subtle)]">
          All payments are processed securely by Stripe. You can change or
          cancel your plan anytime from your account.
        </p>
      </div>
    </div>
  );
};

export default Plans;
