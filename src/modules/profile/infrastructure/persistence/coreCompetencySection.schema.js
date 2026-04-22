import mongoose from "mongoose";

const coreCompetencySectionSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    subHeading: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: Date,

    version: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

coreCompetencySectionSchema.index(
  { isDeleted: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
  },
);

export const CoreCompetencySectionModel =
  mongoose.models.CoreCompetencySection ||
  mongoose.model("CoreCompetencySection", coreCompetencySectionSchema);
