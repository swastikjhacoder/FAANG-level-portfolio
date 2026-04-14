import mongoose from "mongoose";
 import { sanitizeStrings } from "@/shared/utils/mongooseSanitizer";

const profileSchema = new mongoose.Schema(
  {
    name: {
      first: { type: String, required: true, trim: true },
      last: { type: String, required: true, trim: true },
    },

    roles: {
      type: [String],
      required: true,
      index: true,
    },

    description: {
      type: [String],
      required: true,
    },

    profileImage: {
      url: String,
      publicId: String,
    },

    dateOfBirth: Date,

    maritalStatus: {
      type: String,
      enum: ["single", "married", "other"],
    },

    languages: {
      type: [String],
      index: true,
    },

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: Date,

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

profileSchema.set("toJSON", {
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

profileSchema.index({ roles: 1 });
profileSchema.index({ languages: 1 });

profileSchema.pre("save", function () {
  sanitizeStrings(this);
});

profileSchema.pre(["findOneAndUpdate", "updateOne"], function () {
  const update = this.getUpdate();
  if (update) sanitizeStrings(update);
});

export const ProfileModel =
  mongoose.models.Profile || mongoose.model("Profile", profileSchema);
