import { NextResponse } from "next/server";

import { SkillSectionRepository } from "@/modules/profile/infrastructure/persistence/skillSection.repository";
import { AddSkillSectionUseCase } from "@/modules/profile/application/useCases/addSkillSection.usecase";
import { AddSkillSectionDTO } from "@/modules/profile/application/dto/addSkillSection.dto";

import { handleApiError } from "@/shared/utils/errorHandler";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";
import { authGuard } from "@/modules/auth/security/guards/auth.guard";
import connectDB from "@/shared/lib/db";

const repo = new SkillSectionRepository();
const useCase = new AddSkillSectionUseCase(repo);

export const POST = withCsrf(
  authGuard(async (req) => {
    try {
      await connectDB();
      const body = await req.json();
      const dto = new AddSkillSectionDTO(body);

      const result = await useCase.execute(dto, req.user);

      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      if (error?.code === 11000) {
        return NextResponse.json(
          { message: "Skill section already exists" },
          { status: 409 },
        );
      }

      return handleApiError(error);
    }
  }),
);

export async function GET() {
  try {
    await connectDB();
    const section = await repo.get();

    return NextResponse.json({ data: section || null }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export const PATCH = withCsrf(
  authGuard(async (req) => {
    try {
      await connectDB();
      const body = await req.json();

      const dto = new AddSkillSectionDTO(body);

      const result = await useCase.execute(dto, req.user);

      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      return handleApiError(error);
    }
  }),
);

export const DELETE = withCsrf(
  authGuard(async () => {
    try {
      await connectDB();
      await repo.delete();

      return NextResponse.json(
        { message: "Skill section deleted successfully" },
        { status: 200 },
      );
    } catch (error) {
      return handleApiError(error);
    }
  }),
);
