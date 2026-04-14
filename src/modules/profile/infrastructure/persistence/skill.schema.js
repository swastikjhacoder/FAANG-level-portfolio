import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    experience: {
      type: Number,
      min: 0,
      max: 50,
    },

    proficiency: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
    },

    icon: {
      url: String,
      publicId: String,
    },

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: Date,

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

skillSchema.index({ profileId: 1, name: 1 }, { unique: true });

export const SkillModel =
  mongoose.models.Skill || mongoose.model("Skill", skillSchema);
