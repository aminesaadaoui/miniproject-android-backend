import mongoose from "mongoose";

const TestSchema = new mongoose.Schema({
  test_status: {
    type: Number,
    enum: [1, 2, 3],
    default: 1,
  },
  test_name: {
    type: String,
    maxlength: 40,
    required: true,
  },
});

export default mongoose.model("Test", TestSchema);
