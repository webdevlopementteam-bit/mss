import axios from "axios";

const BULK_V2_URL = "https://www.fast2sms.com/dev/bulkV2";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Sends a single-variable DLT OTP SMS via Fast2SMS's bulkV2 route, using the
// approved template configured in env (FAST2SMS_SENDER_ID / FAST2SMS_DLT_TEMPLATE_ID).
// Retries twice on network/5xx failure before giving up.
export const sendOtpSms = async (mobile, otp) => {
  const params = {
    authorization: process.env.FAST2SMS_API_KEY,
    route: "dlt",
    sender_id: process.env.FAST2SMS_SENDER_ID,
    message: process.env.FAST2SMS_DLT_TEMPLATE_ID,
    variables_values: otp,
    numbers: mobile,
  };

  const attempts = 3;
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const { data } = await axios.get(BULK_V2_URL, { params, timeout: 10000 });

      if (data?.return) {
        console.log(`[fast2sms] OTP sent to ${mobile} — request_id: ${data.request_id}`);
        return { success: true, requestId: data.request_id };
      }

      lastError = data?.message?.[0] || "Fast2SMS did not confirm delivery";
      console.error(`[fast2sms] attempt ${attempt} failed for ${mobile}:`, lastError);
    } catch (err) {
      lastError = err.response?.data?.message?.[0] || err.message;
      console.error(`[fast2sms] attempt ${attempt} error for ${mobile}:`, lastError);
    }

    if (attempt < attempts) await sleep(500 * attempt);
  }

  return { success: false, error: lastError };
};
