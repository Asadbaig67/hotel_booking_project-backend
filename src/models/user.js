import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const userschema = new mongoose.Schema({
  firstName: {
    type: String,
    
  },
  lastName: {
    type: String,
    
  },
  googleId: {
    type: String,
  },
  email: {
    type: String,
    
  },
  photo: {
    type: String,
  },
  account_type: {
    type: String,
    
  },
  partner_type: {
    type: String,
  },
  notifications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
    }
  ],
  
  password: {
    type: String,
    
  },
  c_password: {
    type: String,
    
  },
  tokens: [
    {
      token: {
        type: String,
        
      },
    },
  ],
});

// password hashing
userschema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcryptjs.hash(this.password, 12);
    // this.c_password = await bcryptjs.hash(this.c_password, 12);
  }
  next();
});

// generating token
userschema.methods.generatetoken = async function () {
  try {
    let tokenValue = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({ token: tokenValue });
    await this.save();
    return tokenValue;
  } catch (error) {
    console.log(error);
  }
};

const User = mongoose.model("USER", userschema);

export default User;
