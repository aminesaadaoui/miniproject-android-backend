import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
      unique: true,
    },
    name: {
      type: String,
      require: true,
      min: 3,
      max: 20,
    },

    password: {
      type: String,
      required: true,
    },
    firstname: {
      type: String,
      require: true,
      min: 3,
      max: 20,
      default: null,
    },
    lastname: {
      type: String,
      require: true,
      min: 3,
      max: 20,
      default: null,
    },
    genders: {
      type: String,
      enum: ["Male", "female"],
      default: "Male",
    },
    adresse: {
      type: String,
      default: null,
    },
    birthdate: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },

    resetToken: {
      type: String,
    },
    expiredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
