import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    name: {
      firstName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
      },
      lastName: {
        type: String,
        trim: true,
      },
      displayName: {
        type: String,
        trim: true,
        index: true,
      },
    },

    userImage: {
      type: {
        url: String,
        publicId: String,
        resourceType: String,
      },
      default: null,
    },

    roles: {
      type: [String],
      default: ["USER"],
      index: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isLocked: {
      type: Boolean,
      default: false,
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    lastLoginAt: Date,
    passwordChangedAt: Date,

    mfaEnabled: {
      type: Boolean,
      default: false,
    },

    mfaSecret: {
      type: String,
      select: false,
    },

    deviceFingerprint: {
      type: String,
      index: true,
    },

    sessionVersion: {
      type: Number,
      default: 0,
    },

    createdByIp: String,
    lastLoginIp: String,

    emailVerificationToken: {
      type: String,
      default: null,
    },

    emailVerificationExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.index({ sessionVersion: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index(
  {
    emailVerificationToken: 1,
    emailVerificationExpires: 1,
  },
  {
    partialFilterExpression: {
      emailVerificationToken: { $ne: null },
    },
  },
);

UserSchema.set("toJSON", {
  transform: (_, ret) => {
    delete ret.passwordHash;
    delete ret.mfaSecret;
    return ret;
  },
});

const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);

export default UserModel;
