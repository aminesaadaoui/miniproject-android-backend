import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  remarque: {
    type: String,
  },
  imagereview: {
    type: String,
    default: null,
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

export default mongoose.model("Review", ReviewSchema);
