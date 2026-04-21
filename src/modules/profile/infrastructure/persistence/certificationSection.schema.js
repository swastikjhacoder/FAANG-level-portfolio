import mongoose from "mongoose";

const certificationSectionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "certification",
      unique: true,
    },

    heading: { type: String, required: true, trim: true },
    subHeading: { type: String, trim: true },
    description: { type: String, trim: true },

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

certificationSectionSchema.index({ key: 1 }, { unique: true });

export const CertificationSectionModel =
  mongoose.models.CertificationSection ||
  mongoose.model("CertificationSection", certificationSectionSchema);
