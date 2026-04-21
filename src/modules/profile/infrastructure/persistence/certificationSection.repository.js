import { CertificationSectionModel } from "./certificationSection.schema";

export class CertificationSectionRepository {
  async upsert(data, userId) {
    return CertificationSectionModel.findOneAndUpdate(
      { key: "certification" },
      {
        heading: data.heading,
        subHeading: data.subHeading,
        description: data.description,
        updatedBy: userId,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    ).lean();
  }

  async get() {
    const section = await CertificationSectionModel.findOne({
      key: "certification",
    }).lean();

    return (
      section || {
        heading: "Certifications",
        subHeading: "My certifications",
        description: "List of certifications I have achieved.",
      }
    );
  }
}
