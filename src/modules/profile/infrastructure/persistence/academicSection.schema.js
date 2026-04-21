import mongoose from "mongoose";

const AcademicSectionSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    subHeading: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
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

AcademicSectionSchema.index({}, { unique: true });

export const AcademicSectionModel =
  mongoose.models.AcademicSection ||
  mongoose.model("AcademicSection", AcademicSectionSchema);
