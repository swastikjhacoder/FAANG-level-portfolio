import mongoose from "mongoose";

const certificationSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    organization: { type: String, required: true, trim: true },
    certificationName: { type: String, required: true, trim: true },

    startDate: Date,
    endDate: Date,

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: Date,

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

certificationSchema.index({ profileId: 1, organization: 1 });

export const CertificationModel =
  mongoose.models.Certification ||
  mongoose.model("Certification", certificationSchema);
