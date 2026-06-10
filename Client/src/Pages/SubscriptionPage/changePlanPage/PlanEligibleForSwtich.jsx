import { ArrowRight, Calendar, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { changePlan } from "../../../Apis/subscriptionApi";
import { monthlyPlans, yearlyPlans } from "../Plans";
import { redirectToStripeCheckout } from "../../../Utils/stripeCheckout";

const PlanEligibleForSwtich = ({ plansEligible, activePlan }) => {
  const [loadingPlanId, setLoadingPlanId] = useState(null);

  const handleChangePlan = async (planId) => {
    setLoadingPlanId(planId);
    try {
      const res = await changePlan(planId);
      if (!res?.success) {
        toast.error(res?.message || "Unable to start Stripe checkout");
        return;
      }

      redirectToStripeCheckout({ checkoutUrl: res.data.checkoutUrl });
    } catch (error) {
      toast.error(error?.message || "Unable to start Stripe checkout");
    } finally {
      setLoadingPlanId(null);
    }
  };

  const PlansEligibleForSwitch = useMemo(() => {
    return [...monthlyPlans, ...yearlyPlans].filter((plan) =>
      plansEligible.includes(plan.id.value)
    );
  }, [plansEligible]);

  return (
    <>
      <div>
        <div className="premium-panel mb-6 p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--primary)] mb-2">
            Plan switch
          </p>
          <h3 className="text-xl font-bold text-gray-900">
            Available Plans to Switch To
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {PlansEligibleForSwitch.length} plan
            {PlansEligibleForSwitch.length !== 1 ? "s" : ""} available for
            change
          </p>
        </div>

        {PlansEligibleForSwitch.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PlansEligibleForSwitch.map((plan) => {
              const Icon = plan.icon;
              const isUpgrade =
                activePlan?.planName === "Pro" && plan.name === "Premium";
              const isDowngrade =
                activePlan?.planName === "Premium" && plan.name !== "Premium";

              return (
                <div
                  key={plan.id.value}
                  className={`premium-card overflow-hidden ${
                    isUpgrade
                      ? "ring-2 ring-emerald-200"
                      : isDowngrade
                      ? "ring-2 ring-amber-200"
                      : ""
                  }`}
                >
                  <div className="p-6">
                    {/* Plan Icon & Header */}
                    <div className="mb-5">
                      <div className="inline-flex p-2 rounded-lg mb-3 bg-gray-100">
                        <Icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1">
                        {plan.name}
                      </h4>
                      <p className="text-xs font-medium text-blue-600 mb-1">
                        {plan.tagline}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-6 pb-6 border-b border-[var(--border)]">
                      {plan.price === 0 ? (
                        <div className="flex items-baseline">
                          <span className="text-2xl font-bold text-gray-900">
                            Free
                          </span>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-baseline mb-1">
                            <span className="text-2xl font-bold text-gray-900">
                              ₹{plan.price}
                            </span>
                            <span className="text-gray-600 ml-1 text-sm">
                              /{plan.billingCycle || "month"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Change Button */}
                    <button
                      onClick={() => handleChangePlan(plan.id.value)}
                      disabled={loadingPlanId === plan.id.value}
                      className={`w-full py-2.5 px-6 rounded-xl font-medium transition-all text-sm mb-6 flex items-center justify-center gap-2 ${
                        isUpgrade
                          ? "bg-[var(--success)] text-white hover:brightness-95"
                        : isDowngrade
                          ? "bg-[var(--warning)] text-white hover:brightness-95"
                          : "premium-button-primary"
                      } ${
                        loadingPlanId === plan.id.value &&
                        "opacity-60 cursor-not-allowed"
                      }`}
                    >
                      {loadingPlanId === plan.id.value ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </>
                      ) : isUpgrade ? (
                        <>
                          <ArrowRight className="w-4 h-4" />
                          <span>Upgrade Plan</span>
                        </>
                      ) : isDowngrade ? (
                        <>
                          <ArrowRight className="w-4 h-4" />
                          <span>Downgrade Plan</span>
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4" />
                          <span>Change Plan</span>
                        </>
                      )}
                    </button>

                    {/* Features */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Includes
                      </p>
                      {plan.features.slice(0, 4).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-700 leading-relaxed">
                            {feature}
                          </span>
                        </div>
                      ))}
                      {plan.features.length > 4 && (
                        <p className="text-xs text-gray-500 italic mt-2">
                          +{plan.features.length - 4} more features
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="premium-empty p-8 text-center">
            <div className="inline-flex p-3 rounded-full bg-gray-100 mb-4">
              <Calendar className="w-6 h-6 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              No Plans Available for Change
            </h4>
            <p className="text-gray-600 text-sm">
              You may be eligible to change your plan after your next billing
              cycle. Please check back later.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default PlanEligibleForSwtich;
