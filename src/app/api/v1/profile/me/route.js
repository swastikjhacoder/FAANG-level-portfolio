import { NextResponse } from "next/server";
import { ProfileRepository } from "@/modules/profile/infrastructure/persistence/profile.repository";
import { handleApiError } from "@/shared/utils/errorHandler";
import { authGuard } from "@/modules/auth/security/guards/auth.guard";

const repo = new ProfileRepository();

export const GET = authGuard(async (req) => {
  try {
    const userId = req.user.userId;

    if (!userId) {
      throw new Error("Invalid userId from auth");
    }

    let profile = await repo.findByUserId(userId);

    if (!profile) {
      const user = req.user;

      profile = await repo.create({
        userId,
        name: {
          first: user.firstName || "User",
          last: user.lastName || "Name",
        },
      });
    }

    return NextResponse.json({ data: profile }, { status: 200 });
  } catch (error) {
    return handleApiError(error, req);
  }
});
