import { profileValidation } from "../validation/profile.schema.js";
import { sanitizeProfileInput } from "../../security/sanitizers/profile.sanitizer.js";
import { ProfileService } from "../../application/services/profile.service.js";

const service = new ProfileService();

export const createProfile = async (req, res) => {
  try {
    const parsed = profileValidation.parse(req.body);

    const cleanData = sanitizeProfileInput(parsed);

    const result = await service.createProfile(cleanData, req.user);

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
