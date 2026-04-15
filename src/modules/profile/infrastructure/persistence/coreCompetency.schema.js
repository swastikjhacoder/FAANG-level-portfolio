import mongoose from "mongoose";

const competencyItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500 },

    icon: {
      url: { type: String },
      publicId: { type: String },
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const competencySchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      unique: true,
      index: true,
    },

    heading: { type: String, required: true, trim: true, maxlength: 120 },
    subHeading: { type: String, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 1000 },

    data: {
      type: [competencyItemSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: "Too many competency items",
      },
    },

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: Date,

    version: { type: Number, default: 0 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

competencySchema.index({ profileId: 1, isDeleted: 1 });

export const CompetencyModel =
  mongoose.models.Competency || mongoose.model("Competency", competencySchema);
