import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  statu: {
    type: Number,
    enum: [0, 1],
    default: 1,
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

export default mongoose.model("Booking", BookingSchema);
