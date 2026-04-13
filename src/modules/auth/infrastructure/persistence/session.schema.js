import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    currentTokenHash: {
      type: String,
      required: true,
      select: false,
    },

    previousTokenHash: {
      type: String,
      default: null,
      select: false,
    },

    fingerprint: {
      type: String,
    },

    userAgent: String,
    ip: String,

    expiresAt: {
      type: Date,
      required: true,
    },

    isRevoked: {
      type: Boolean,
      default: false,
    },

    sessionVersion: {
      type: Number,
      default: 0,
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
SessionSchema.index({ fingerprint: 1 });
SessionSchema.index({ sessionVersion: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

SessionSchema.pre("save", async function () {
  this.lastUsedAt = new Date();
});

export default mongoose.models.Session ||
  mongoose.model("Session", SessionSchema);
