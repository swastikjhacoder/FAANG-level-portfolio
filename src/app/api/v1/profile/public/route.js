import { NextResponse } from "next/server";
import { ProfileRepository } from "@/modules/profile/infrastructure/persistence/profile.repository";
import { handleApiError } from "@/shared/utils/errorHandler";

const repo = new ProfileRepository();

export async function GET() {
  try {
    const profile = await repo.findLatestActive();

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "No profile found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: profile,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
