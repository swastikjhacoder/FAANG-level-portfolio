import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    refreshTokenHash: {
      type: String,
      required: true,
      select: false,
    },

    userAgent: String,
    ip: String,

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },

    rotatedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
    },

    lastUsedAt: Date,
  },
  {
    timestamps: true,
  },
);

SessionSchema.index({ userId: 1, isRevoked: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Session ||
  mongoose.model("Session", SessionSchema);
