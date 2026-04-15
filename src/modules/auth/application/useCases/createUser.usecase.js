import { hashPassword } from "@/shared/utils/hash";
import { User } from "../../domain/entities/User.entity";
import { ROLES, isValidRole } from "@/shared/constants/roles";
import { UserRepository } from "@/modules/user/infrastructure/user.repository";

export class CreateUserUseCase {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async execute(input) {
    const { email, password, name, role } = input;

    if (!isValidRole(role)) {
      throw new Error("Invalid role");
    }

    if (role === ROLES.SUPER_ADMIN) {
      throw new Error("Cannot assign SUPER_ADMIN role");
    }

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new Error("User already exists");
    }

    const passwordHash = await hashPassword(password);

    const user = new User({
      email,
      passwordHash,
      name,
      roles: [role],
      isEmailVerified: true,
    });

    const saved = await this.userRepository.create(user);

    return {
      user: saved,
    };
  }
}
