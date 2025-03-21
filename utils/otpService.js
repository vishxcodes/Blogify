const nodemailer = require("nodemailer");
const OTPStore = new Map(); // Temporary store for OTPs (Use Redis or DB for production)
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "darrendsa90@gmail.com", // Your email
    pass:"ntxb lhov rxen tlee", // Your email password
  },
});

// 1. Generate & send OTP
async function sendOTP({ email, subject, message, duration }) {
  const otp = crypto.randomInt(100000, 999999).toString(); // Generate 6-digit OTP
  const expiresAt = Date.now() + duration * 60 * 1000; // Expiry time

  OTPStore.set(email, { otp, expiresAt });

  const mailOptions = {
    from:"darrendsa90@gmail.com",
    to: email,
    subject,
    text: `${message}\nYour OTP is: ${otp}\nThis OTP is valid for ${duration} minutes.`,
  };

  await transporter.sendMail(mailOptions);
  return { success: true, message: "OTP sent successfully" };
}

// 2. Verify OTP
async function verifyOTP(email,otp) {
  const otpData = OTPStore.get(email);

  if (!otpData) return false;
  if (otpData.expiresAt < Date.now()) {
    OTPStore.delete(email); // Remove expired OTP
    return false;
  }
  if (otpData.otp !== otp) return false;

  OTPStore.delete(email); // OTP is valid, remove from store
  return true;
}

module.exports = { sendOTP, verifyOTP };
