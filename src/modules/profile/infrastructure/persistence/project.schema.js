import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    name: { type: String, required: true, trim: true },

    liveUrl: String,
    githubUrl: String,

    techStack: [
      {
        name: String,
        icon: {
          url: String,
          publicId: String,
        },
      },
    ],

    description: [{ type: String }],

    screenshot: {
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

projectSchema.index({ profileId: 1, name: 1 });

export const ProjectModel =
  mongoose.models.Project || mongoose.model("Project", projectSchema);
