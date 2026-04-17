import mongoose from "mongoose";

const certificationSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    content: {
      certificationName: { type: String, required: true, trim: true },
      organization: { type: String, required: true, trim: true },

      issueDate: Date,
      expiryDate: Date,

      credentialId: String,
      credentialUrl: String,

      certificateDownloadUrl: String,
      certificatePublicId: String,

      description: String,
    },

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: Date,

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

certificationSchema.index({
  profileId: 1,
  isDeleted: 1,
  "content.issueDate": -1,
});

export const CertificationModel =
  mongoose.models.Certification ||
  mongoose.model("Certification", certificationSchema);
