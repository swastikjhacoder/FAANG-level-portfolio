import mongoose from "mongoose";

const softSkillSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      unique: true,
      index: { name: "unique_profile_softskills" },
    },
    items: {
      type: [
        {
          type: String,
          minlength: 1,
          maxlength: 50,
          lowercase: true,
        },
      ],
      required: true,
      validate: [
        (arr) => arr.length > 0 && arr.length <= 20,
        "Soft skills must be between 1 and 20 items",
      ],
    },
  },
  { timestamps: true },
);

export default mongoose.models.SoftSkill ||
  mongoose.model("SoftSkill", softSkillSchema);
