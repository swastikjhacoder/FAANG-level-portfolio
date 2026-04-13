import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    currentTokenHash: {
      type: String,
      required: true,
      select: false,
      index: true,
    },

    previousTokenHash: {
      type: String,
      default: null,
      select: false,
    },

    fingerprint: {
      type: String,
      index: true,
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

    sessionVersion: {
      type: Number,
      default: 0,
      index: true,
    },

    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

SessionSchema.index({ userId: 1, isRevoked: 1 });

SessionSchema.index({ currentTokenHash: 1 });
SessionSchema.index({ previousTokenHash: 1 });

SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

SessionSchema.pre("save", function (next) {
  this.lastUsedAt = new Date();
  next();
});

export default mongoose.models.Session ||
  mongoose.model("Session", SessionSchema);
