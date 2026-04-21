import connectDB from "@/shared/lib/db";

import withRateLimit from "@/shared/security/middleware/rateLimit.middleware";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";

import { sanitizeInput } from "@/shared/security/sanitizers/input.sanitizer";

import { addAcademicSectionDTO } from "@/modules/profile/application/dto/addAcademicSection.dto";

import { AcademicSectionRepository } from "@/modules/profile/infrastructure/persistence/academicSection.repository";

import {
  UpsertAcademicSectionUseCase,
  GetAcademicSectionUseCase,
  DeleteAcademicSectionUseCase,
} from "@/modules/profile/application/useCases/academicSection.usecase";

import { authGuard } from "@/modules/auth/security/guards/auth.guard";
import { roleGuard } from "@/modules/auth/security/guards/role.guard";

import { ROLES } from "@/shared/constants/roles";
import { ValidationError } from "@/shared/errors";

const repo = new AcademicSectionRepository();

const upsertUC = new UpsertAcademicSectionUseCase(repo);
const getUC = new GetAcademicSectionUseCase(repo);
const deleteUC = new DeleteAcademicSectionUseCase(repo);

const DEV = process.env.NODE_ENV === "development";
const ADMIN = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

const safeJson = async (req) => {
  try {
    return await req.json();
  } catch {
    throw new ValidationError("Invalid JSON body");
  }
};

const ok = (data) => Response.json({ success: true, data });

const fail = (error) =>
  Response.json(
    {
      success: false,
      message:
        error?.code === "BAD_USER_INPUT"
          ? error.message
          : "Internal Server Error",
      code: error.code || "INTERNAL_ERROR",
    },
    { status: error.status || 500 },
  );

const upsertHandler = async (req) => {
  try {
    await connectDB();

    const raw = await safeJson(req);
    const sanitized = sanitizeInput(raw);
    const validated = addAcademicSectionDTO.parse(sanitized);

    const result = await upsertUC.execute(validated, req.user);

    return ok(result);
  } catch (err) {
    return fail(err);
  }
};

const getHandler = async () => {
  try {
    await connectDB();

    const data = await getUC.execute();

    return ok(data);
  } catch (err) {
    return fail(err);
  }
};

const deleteHandler = async (req) => {
  try {
    await connectDB();

    await deleteUC.execute(req.user);

    return ok({ success: true });
  } catch (err) {
    return fail(err);
  }
};

const rateConfig = (prod) => (DEV ? { limit: 1000, window: 60 } : prod);

const upsert = withRateLimit(
  withCsrf(authGuard(roleGuard(upsertHandler, ADMIN))),
  rateConfig({ limit: 20, window: 60 }),
);

const remove = withRateLimit(
  withCsrf(authGuard(roleGuard(deleteHandler, ADMIN))),
  rateConfig({ limit: 10, window: 60 }),
);

const get = withRateLimit(getHandler, rateConfig({ limit: 100, window: 60 }));

export async function POST(req) {
  return upsert(req);
}

export async function PATCH(req) {
  return upsert(req);
}

export async function GET() {
  return get();
}

export async function DELETE(req) {
  return remove(req);
}
