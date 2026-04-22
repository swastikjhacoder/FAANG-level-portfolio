import { ContactSectionModel } from "./contactSection.schema";

export const ContactSectionRepository = {
  async get() {
    return await ContactSectionModel.findOne().lean();
  },

  async upsert(data) {
    return await ContactSectionModel.findOneAndUpdate(
      {},
      {
        $set: {
          heading: data.heading,
          subHeading: data.subHeading,
          description: data.description,
        },
      },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    ).lean();
  },
};
