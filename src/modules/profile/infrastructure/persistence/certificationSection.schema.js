import mongoose from "mongoose";

const certificationSectionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "certification",
      unique: true,
    },

    heading: { type: String, required: true },
    subHeading: { type: String },
    description: { type: String },

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const CertificationSectionModel =
  mongoose.models.CertificationSection ||
  mongoose.model("CertificationSection", certificationSectionSchema);
