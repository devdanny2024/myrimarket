const Paystack = require("paystack");

function getPaystack() {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    throw new Error("PAYSTACK_SECRET_KEY not configured");
  }
  return Paystack(secret);
}

module.exports = { getPaystack };
