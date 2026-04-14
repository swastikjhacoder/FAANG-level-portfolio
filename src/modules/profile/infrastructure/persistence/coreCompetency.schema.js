import mongoose from "mongoose";

const competencySchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    heading: { type: String, required: true },
    description: { type: String, required: true },

    icon: {
      url: String,
      publicId: String,
    },

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: Date,
  },
  { timestamps: true },
);

competencySchema.index({ profileId: 1, heading: 1 });

export const CompetencyModel =
  mongoose.models.Competency || mongoose.model("Competency", competencySchema);
