export const redirectToStripeCheckout = ({ checkoutUrl }) => {
  if (!checkoutUrl) {
    throw new Error("Stripe checkout URL was not returned by the server");
  }

  window.location.assign(checkoutUrl);
};
