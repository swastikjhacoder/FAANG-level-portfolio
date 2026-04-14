import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    email: { type: String },
    mobile: { type: String },

    socials: [
      {
        name: String,
        url: String,
        icon: {
          url: String,
          publicId: String,
        },
      },
    ],

    address: String,

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: Date,
  },
  { timestamps: true },
);

export const ContactModel =
  mongoose.models.Contact || mongoose.model("Contact", contactSchema);
