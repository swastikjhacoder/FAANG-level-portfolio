import { NextResponse } from "next/server";

import { AboutRepository } from "@/modules/profile/infrastructure/persistence/about.repository";
import { AddAboutUseCase } from "@/modules/profile/application/useCases/addAbout.usecase";
import { AddAboutDTO } from "@/modules/profile/application/dto/addAbout.dto";

import { handleApiError } from "@/shared/utils/errorHandler";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";

import { authGuard } from "@/modules/auth/security/guards/auth.guard";
import { ROLES, hasRole } from "@/shared/constants/roles";

const repo = new AboutRepository();
const useCase = new AddAboutUseCase(repo);

export async function GET(req) {
  try {
    const data = await repo.get();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return handleApiError(error, req);
  }
}

export const POST = withCsrf(
  authGuard(async (req) => {
    try {
      const user = req.user;

      if (!hasRole(user.roles, [ROLES.ADMIN, ROLES.SUPER_ADMIN])) {
        return NextResponse.json(
          { success: false, message: "Forbidden" },
          { status: 403 },
        );
      }

      const body = await req.json();
      const dto = new AddAboutDTO(body);

      const result = await useCase.execute(dto, user);

      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (error) {
      return handleApiError(error, req);
    }
  }),
);

export const PATCH = withCsrf(
  authGuard(async (req) => {
    try {
      const user = req.user;

      if (!hasRole(user.roles, [ROLES.ADMIN, ROLES.SUPER_ADMIN])) {
        return NextResponse.json(
          { success: false, message: "Forbidden" },
          { status: 403 },
        );
      }

      const body = await req.json();
      const dto = new AddAboutDTO(body);

      const result = await useCase.execute(dto, user);

      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (error) {
      return handleApiError(error, req);
    }
  }),
);

export const DELETE = withCsrf(
  authGuard(async (req) => {
    try {
      const user = req.user;

      if (!hasRole(user.roles, ROLES.ADMIN)) {
        return NextResponse.json(
          { success: false, message: "Forbidden" },
          { status: 403 },
        );
      }

      const result = await repo.softDelete();

      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (error) {
      return handleApiError(error, req);
    }
  }),
);
