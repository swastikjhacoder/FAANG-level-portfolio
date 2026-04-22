import mongoose from "mongoose";

const competencySchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },

    items: [
      {
        type: String,
        trim: true,
        minlength: 2,
        maxlength: 100,
      },
    ],

    version: { type: Number, default: 0 },

    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true },
);

competencySchema.index(
  { profileId: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
  },
);

export const CompetencyModel =
  mongoose.models.Competency || mongoose.model("Competency", competencySchema);
