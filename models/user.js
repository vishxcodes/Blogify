const {createHmac,randomBytes} = require("crypto");
const mongoose = require("mongoose");
const { createTokenForUser } = require("../services/authentication");


const userSchema = new mongoose.Schema({
    fullName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    salt:{
        type:String,
        
    },
    password:{
        type:String,
        required:true,
    },
    ProfileUrl:{
        type:String,
        default:"/images/default.webp",
    },
    role:{
        type:String,
        enum:["USER","ADMIN"],
        default:"USER",
    },

},
{timestamps:true}
);

userSchema.pre("save",function(next){       //mongoose middlewear
   const user = this;                      // this refers to the current user document being saved.

   if(!user.isModified("password")) return;

   const salt = randomBytes(16).toString("hex");
   const hashedPassword = createHmac("sha256",salt)
   .update(user.password)
   .digest("hex");

   this.salt = salt;
   this.password = hashedPassword;
   next();
});

userSchema.static("matchPasswordAndGenerateToken", async function(email,password){
   const user = await this.findOne({email });
   if(!user) throw new Error("User not Found!");
   const salt = user.salt
   const hashedPassword = user.password;
   const userProvidedHash =createHmac("sha256",salt)
   .update(password)
   .digest("hex");

   if(hashedPassword !== userProvidedHash) throw new Error("Incorrect Password");
//    return {...user,password:undefined,salt:undefined};
    // return user;
    const token = createTokenForUser(user);
    return token;
});   

 
const User = mongoose.model("user",userSchema);

module.exports = User;