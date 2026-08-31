import Razorpay from "razorpay";
import crypto from "crypto";

export const getRazorpayInstance = () => {
  const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder";

  return new Razorpay({
    key_id,
    key_secret,
  });
};

export const verifyRazorpaySignature = ({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean => {
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder";

  // In test/demo mode without real keys configured, allow mock verification
  if (key_secret === "rzp_secret_placeholder" && signature.startsWith("mock_sig_")) {
    return true;
  }

  const generatedSignature = crypto
    .createHmac("sha256", key_secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
};

export const verifyWebhookSignature = (
  bodyString: string,
  webhookSignature: string,
  webhookSecret: string
): boolean => {
  if (!webhookSecret || !webhookSignature) return false;

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(bodyString)
    .digest("hex");

  return expectedSignature === webhookSignature;
};
