import { NextResponse } from "next/server";
import { AboutRepository } from "@/modules/profile/infrastructure/persistence/about.repository";
import { AddAboutUseCase } from "@/modules/profile/application/useCases/addAbout.usecase";
import { AddAboutDTO } from "@/modules/profile/application/dto/addAbout.dto";
import { handleApiError } from "@/shared/utils/errorHandler";
import { getUserFromRequest } from "@/shared/utils/helpers";

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

export async function POST(req) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    if (!user.roles?.includes("ADMIN")) {
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
}

export async function DELETE(req) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    if (!user.roles?.includes("ADMIN")) {
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
}
