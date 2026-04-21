import mongoose from "mongoose";

const ServiceSectionSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true, trim: true, maxlength: 150 },
    subHeading: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true, maxlength: 150 },
  },
  { timestamps: true },
);

ServiceSectionSchema.index({}, { unique: true });

export const ServiceSectionModel =
  mongoose.models.ServiceSection ||
  mongoose.model("ServiceSection", ServiceSectionSchema);
