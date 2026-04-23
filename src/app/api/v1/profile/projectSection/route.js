import connectDB from "@/shared/lib/db";

import { ProjectSectionRepository } from "@/modules/profile/infrastructure/persistence/projectSection.repository";
import { AddProjectSectionUseCase } from "@/modules/profile/application/useCases/addProjectSection.usecase";
import { UpdateProjectSectionUseCase } from "@/modules/profile/application/useCases/updateProjectSection.usecase";

import { sanitizeInput } from "@/shared/security/sanitizers/input.sanitizer";
import { ValidationError } from "@/shared/errors";

import { authGuard } from "@/modules/auth/security/guards/auth.guard";
import { roleGuard } from "@/modules/auth/security/guards/role.guard";

import { ROLES } from "@/shared/constants/roles";

import withRateLimit from "@/shared/security/middleware/rateLimit.middleware";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";

const repo = new ProjectSectionRepository();
const addUseCase = new AddProjectSectionUseCase(repo);
const updateUseCase = new UpdateProjectSectionUseCase(repo);

const DEV = process.env.NODE_ENV === "development";
const ADMIN = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

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

const getHandler = async () => {
  try {
    await connectDB();
    const section = await repo.get();
    return ok(section);
  } catch (err) {
    return fail(err);
  }
};

const postHandler = async (req) => {
  try {
    await connectDB();

    const raw = await req.json();
    const sanitized = sanitizeInput(raw);

    const existing = await repo.get();
    if (existing) {
      throw new ValidationError(
        "Section already exists. Use PUT or PATCH to update.",
      );
    }

    const result = await addUseCase.execute(sanitized, req.user);
    return ok(result);
  } catch (err) {
    return fail(err);
  }
};

const putHandler = async (req) => {
  try {
    await connectDB();

    const raw = await req.json();
    const sanitized = sanitizeInput(raw);

    const result = await addUseCase.execute(sanitized, req.user);
    return ok(result);
  } catch (err) {
    return fail(err);
  }
};

const patchHandler = async (req) => {
  try {
    await connectDB();

    const raw = await req.json();
    const sanitized = sanitizeInput(raw);

    const result = await updateUseCase.execute(sanitized, req.user);
    return ok(result);
  } catch (err) {
    return fail(err);
  }
};

const deleteHandler = async () => {
  try {
    await connectDB();
    await repo.delete();
    return ok({ success: true });
  } catch (err) {
    return fail(err);
  }
};

const rateKey = (req) => `rate:${req.ip}:${req.method}:${req.nextUrl.pathname}`;

export const GET = DEV
  ? getHandler
  : withRateLimit(getHandler, {
      limit: 100,
      window: 60,
      key: rateKey,
    });

export const POST = DEV
  ? withCsrf(authGuard(roleGuard(postHandler, ADMIN)))
  : withRateLimit(withCsrf(authGuard(roleGuard(postHandler, ADMIN))), {
      limit: 20,
      window: 60,
      key: rateKey,
    });

export const PUT = DEV
  ? withCsrf(authGuard(roleGuard(putHandler, ADMIN)))
  : withRateLimit(withCsrf(authGuard(roleGuard(putHandler, ADMIN))), {
      limit: 20,
      window: 60,
      key: rateKey,
    });

export const PATCH = DEV
  ? withCsrf(authGuard(roleGuard(patchHandler, ADMIN)))
  : withRateLimit(withCsrf(authGuard(roleGuard(patchHandler, ADMIN))), {
      limit: 20,
      window: 60,
      key: rateKey,
    });

export const DELETE = DEV
  ? withCsrf(authGuard(roleGuard(deleteHandler, ADMIN)))
  : withRateLimit(withCsrf(authGuard(roleGuard(deleteHandler, ADMIN))), {
      limit: 10,
      window: 60,
      key: rateKey,
    });