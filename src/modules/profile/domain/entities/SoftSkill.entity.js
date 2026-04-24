export class SoftSkill {
  constructor({ id, profileId, items }) {
    const normalized = this.#normalize(items);

    if (normalized.length === 0) {
      throw new Error("Soft skills must be a non-empty array");
    }

    this.id = id;
    this.profileId = profileId;
    this.items = Object.freeze(normalized);
  }

  update(items) {
    const normalized = this.#normalize(items);
    this.items = Object.freeze(normalized);
  }

  #normalize(items) {
    if (!Array.isArray(items)) {
      throw new Error("Invalid softSkills: expected array of strings");
    }

    const normalized = [
      ...new Set(
        items
          .filter((item) => typeof item === "string")
          .map((item) => item.trim().toLowerCase())
          .filter(Boolean),
      ),
    ];

    return normalized.sort((a, b) => a.localeCompare(b));
  }
}
