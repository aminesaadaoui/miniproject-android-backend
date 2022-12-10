import mongoose from "mongoose";

const MedecinSchema = new mongoose.Schema({
  specialite: {
    type: String,
  },
  experience: {
    type: Number,
  },
  description: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

export default mongoose.model("Medecin", MedecinSchema);
