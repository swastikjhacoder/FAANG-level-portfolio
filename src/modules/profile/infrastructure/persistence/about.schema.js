import mongoose from "mongoose";
import xss from "xss";

const sanitize = (value) => {
  if (typeof value !== "string") return value;
  return xss(value.trim());
};

const FORBIDDEN_KEYS = ["$where", "$regex", "$gt", "$lt", "$ne", "$in"];

const checkInjection = (obj) => {
  if (!obj || typeof obj !== "object") return;

  for (const key in obj) {
    if (FORBIDDEN_KEYS.includes(key)) {
      throw new Error("Injection attempt detected");
    }

    if (typeof obj[key] === "object") {
      checkInjection(obj[key]);
    }
  }
};

const AboutSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 120,
      set: sanitize,
    },

    subHeading: {
      type: String,
      minlength: 3,
      maxlength: 200,
      set: sanitize,
    },

    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 3000,
      set: sanitize,
    },

    singleton: {
      type: Boolean,
      default: true,
      unique: true,
      immutable: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
      index: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: "throw",
  },
);

AboutSchema.index({ singleton: 1 }, { unique: true });

AboutSchema.pre("save", async function () {
  if (this.isNew) {
    const AboutModel = mongoose.model("About");
    const existing = await AboutModel.findOne({});

    if (existing) {
      throw new Error("About section already exists");
    }
  }

  checkInjection(this.toObject());
});

AboutSchema.pre(
  ["findOneAndUpdate", "updateOne", "updateMany"],
  async function () {
    const update = this.getUpdate();

    if (!update || Object.keys(update).length === 0) {
      throw new Error("Empty update is not allowed");
    }

    checkInjection(update);
  },
);

AboutSchema.pre(/^find/, function () {
  this.where({ isDeleted: false });
});

AboutSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.isDeleted;
  return obj;
};

const About = mongoose.models.About || mongoose.model("About", AboutSchema);

export default About;
