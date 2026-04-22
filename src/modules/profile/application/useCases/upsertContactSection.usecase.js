import { ContactSectionRepository } from "../../infrastructure/persistence/contactSection.repository";
import { upsertContactSectionDTO } from "../dto/upsertContactSection.dto";

export class UpsertContactSectionUseCase {
  async execute(data) {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid input");
    }

    const validatedData = upsertContactSectionDTO(data);

    return await ContactSectionRepository.upsert(validatedData);
  }
}
