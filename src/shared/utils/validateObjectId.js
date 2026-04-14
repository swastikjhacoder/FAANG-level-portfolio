import mongoose from "mongoose";
import { ValidationError } from "@/shared/errors";

export const validateObjectId = (id, field = "id") => {
  if (!id) {
    throw new ValidationError(`Missing ${field}`);
  }

  if (id instanceof mongoose.Types.ObjectId) {
    return true;
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError(`Invalid ${field}`);
  }

  return true;
};

export const validateObjectIds = (fields = {}) => {
  if (typeof fields !== "object" || fields === null) {
    throw new ValidationError("Invalid fields for ObjectId validation");
  }

  for (const [key, value] of Object.entries(fields)) {
    validateObjectId(value, key);
  }
};
