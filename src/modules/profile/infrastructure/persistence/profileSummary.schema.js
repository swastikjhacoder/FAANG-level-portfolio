import mongoose from "mongoose";

const summarySchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    items: [{ type: String, required: true }],

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: Date,
  },
  { timestamps: true },
);

export const SummaryModel =
  mongoose.models.Summary || mongoose.model("Summary", summarySchema);
