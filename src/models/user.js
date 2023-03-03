import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const userschema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  work: {
    type: String,
    required: true,
  },
  subuser: {
    type: Number,
    required: true,
  },
  subusers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  ],
  password: {
    type: String,
    required: true,
  },
  c_password: {
    type: String,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
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

userschema.methods.generatetoken = async function () {
  try {
    let token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (error) {
    console.log(error);
  }
};

const User = mongoose.model("USER", userschema);

// module.exports = User;

// export default User;

export default User;
