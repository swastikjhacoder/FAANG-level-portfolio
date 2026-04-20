import { NextResponse } from "next/server";

import { SkillSectionRepository } from "@/modules/profile/infrastructure/persistence/skillSection.repository";
import { AddSkillSectionUseCase } from "@/modules/profile/application/useCases/addSkillSection.usecase";
import { AddSkillSectionDTO } from "@/modules/profile/application/dto/addSkillSection.dto";

import { handleApiError } from "@/shared/utils/errorHandler";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";
import { authGuard } from "@/modules/auth/security/guards/auth.guard";

const repo = new SkillSectionRepository();
const useCase = new AddSkillSectionUseCase(repo);

export const POST = withCsrf(
  authGuard(async (req) => {
    try {
      const body = await req.json();

      const dto = new AddSkillSectionDTO(body);

      const result = await useCase.execute(dto, req.user);

      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      return handleApiError(error);
    }
  }),
);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");

    const section = await repo.findByProfileId(profileId);

    return NextResponse.json({ data: section || null }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export const PATCH = withCsrf(
  authGuard(async (req) => {
    try {
      const body = await req.json();

      const { profileId, ...data } = body;

      if (!profileId) {
        return NextResponse.json(
          { message: "profileId is required" },
          { status: 400 },
        );
      }

      const result = await repo.upsert(profileId, data, req.user.id);

      return NextResponse.json(result);
    } catch (error) {
      return handleApiError(error);
    }
  }),
);
