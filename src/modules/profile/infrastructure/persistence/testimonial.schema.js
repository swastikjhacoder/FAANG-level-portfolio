import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    quote: { type: String, required: true },

    senderName: String,
    senderRole: String,
    company: String,

    senderImage: {
      url: String,
      publicId: String,
    },

    approved: {
      type: Boolean,
      default: false,
      index: true,
    },

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: Date,

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

testimonialSchema.index({ profileId: 1, approved: 1 });
testimonialSchema.index({ profileId: 1, quote: 1 }, { unique: true });

export const TestimonialModel =
  mongoose.models.Testimonial ||
  mongoose.model("Testimonial", testimonialSchema);
