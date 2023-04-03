import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const userschema = new mongoose.Schema({
  firstName: {
    type: String,
    // required: true,
  },
  lastName: {
    type: String,
    // required: true,
  },
  googleId: {
    type: String,
    // unique: true
  },
  email: {
    type: String,
    // required: true,
  },
  account_type: {
    type: String,
    // required: true,
  },
  // subuser: {
  //   type: Number,
  //   // required: true,
  // },
  // subusers: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     // required: true,
  //   },
  // ],
  password: {
    type: String,
    // required: true,
  },
  c_password: {
    type: String,
    // required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        // required: true,
      },
    },
  ],
});

// password hashing
userschema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcryptjs.hash(this.password, 12);
    this.c_password = await bcryptjs.hash(this.c_password, 12);
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
