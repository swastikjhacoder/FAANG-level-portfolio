import mongoose from "mongoose";

const ContactSectionSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 120,
    },
    subHeading: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    strict: "throw",
  },
);

export const ContactSectionModel =
  mongoose.models.ContactSection ||
  mongoose.model("ContactSection", ContactSectionSchema);
