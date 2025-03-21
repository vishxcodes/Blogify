const express = require("express");
const User = require("../models/user");
const { sendOTP, verifyOTP } = require("../utils/otpService");


const router = express.Router();


router.get("/signin",(req,res)=>{
    res.render("signin");
});

router.get("/signup",(req,res)=>{
    res.render("signup");
});

router.get("/logout",(req,res)=>{
    res.clearCookie("token").redirect("/user/signin")
});

router.get("/forgotPass",(req,res)=>{
  res.render("forgotPass");
});

router.get("/verifyOTP",(req,res)=>{
  res.render("otp");
});

router.get("/resetPass",(req,res)=>{
  res.render("resetPass");
});



router.post("/signin",async (req,res)=>{
  const {email,password} = req.body;
try {
  const token = await User.matchPasswordAndGenerateToken(email,password);
  return res.cookie("token",token).redirect("/");
} catch (error) {
  res.render("signin",{error:error.message});
}
});

router.post("/forgotPass", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) throw new Error("Email is required");

    const user = await User.findOne({ email });
    if (!user) throw new Error("No account found with this email");

    const otpDetails = {
      email,
      subject: "Password Reset",
      message: "Enter the verification code below to reset your password",
      duration: 5, // OTP valid for 5 minutes
    };

    const createdOTP = await sendOTP(otpDetails);
    req.session.email = email;
   res.redirect("/user/verifyOTP")
  } catch (error) {
    res.render("forgotPass", { error: error.message });
  }
});


router.post("/verifyOTP", async (req, res) => {
  try {
    const {otp} = req.body;
    const email = req.session.email;
    if (!otp) throw new Error("OTP is required");

    const isVerified = await verifyOTP(email,otp);
    if (!isVerified) throw new Error("Invalid or expired OTP");

    res.redirect("/user/resetPass");
  } catch (error) {
    res.render("forgotPass", { error: error.message });
  }
});

router.post("/resetPass", async (req, res) => {
    const { password } = req.body;
    const email = req.session.email;

    try {
      if (!password) throw new Error("password is required");
      const user = await User.findOne({email});
      user.password = password;
      await user.save();
      res.redirect("/user/signin");
    } catch (error) {
      res.render("resetPass",{error:error.message});
    }
});

router.post("/signup",async (req,res)=>{
    const {fullName,email,password} = req.body;   
    await User.create({
        fullName,
        email,
        password,
    });
   return res.redirect("/user/signin");
});


module.exports = router;