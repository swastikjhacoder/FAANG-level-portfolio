import UserModel from "./user.schema";
import {
  sanitizeMongoQuery,
  sanitizeQuery,
} from "@/shared/security/sanitizers/mongo.sanitizer";

export class UserRepository {
  async findByEmail(email, { includePassword = false } = {}) {
    const safeQuery = sanitizeQuery(
      sanitizeMongoQuery({
        email: email.trim().toLowerCase(),
      }),
    );

    let query = UserModel.findOne(safeQuery);

    if (includePassword) {
      query = query.select("+passwordHash");
    }

    return await query.lean({ getters: true });
  }
}
