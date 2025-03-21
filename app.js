require("dotenv").config();
const express = require("express");
const path = require("path");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { checkforAuthenticationCookie } = require("./middlewear/auth");
const Blog = require("./models/blog");
const session = require("express-session");


const app = express();
const PORT = process.env.PORT;

mongoose
  .connect(process.env.MONGO_URL)
  .then((e) => console.log("mongoDb connected"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(checkforAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));
app.use(
  session({
    secret: "$riona@123",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, 
  })
);
app.get("/", async(req, res) => {
  const allBlogs = await Blog.find({});
  res.render("home",{
    user: req.user,
    blogs:allBlogs
  }); 
}); 
app.use("/user", userRoute);
app.use("/blog",blogRoute);

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
