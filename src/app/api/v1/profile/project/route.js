import connectDB from "@/shared/lib/db";

import { withRateLimit } from "@/shared/security/middleware/rateLimit.middleware";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";

import { sanitizeInput } from "@/shared/security/sanitizers/input.sanitizer";

import { addProjectDTO } from "@/modules/profile/application/dto/addProject.dto";

import { AddProjectUseCase } from "@/modules/profile/application/useCases/addProject.usecase";
import { UpdateProjectUseCase } from "@/modules/profile/application/useCases/updateProject.usecase";
import { DeleteProjectUseCase } from "@/modules/profile/application/useCases/deleteProject.usecase";

import { ProjectRepository } from "@/modules/profile/infrastructure/persistence/project.repository";

import { authGuard } from "@/modules/auth/security/guards/auth.guard";
import { roleGuard } from "@/modules/auth/security/guards/role.guard";

import { ROLES } from "@/shared/constants/roles";

import { validateObjectId } from "@/shared/utils/validateObjectId";
import { ValidationError } from "@/shared/errors";
import auditLogger from "@/shared/security/audit/audit.logger";

const repo = new ProjectRepository();

const createUC = new AddProjectUseCase();
const updateUC = new UpdateProjectUseCase(repo);
const deleteUC = new DeleteProjectUseCase(repo);

const DEV = process.env.NODE_ENV === "development";
const ADMIN = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

const safeFormData = async (req) => {
  try {
    return await req.formData();
  } catch {
    throw new ValidationError("Invalid multipart/form-data");
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

const createHandler = async (req) => {
  try {
    await connectDB();

    const raw = await safeJson(req);
    const sanitized = sanitizeInput(raw);
    const validated = addProjectDTO.parse(sanitized);

    validateObjectId(validated.profileId, "profileId");

    const result = await createUC.execute(validated, req.user);

    auditLogger.log({
      action: "PROJECT_CREATE",
      userId: req.user.id,
      resourceId: result._id,
    });

    return ok(result);
  } catch (err) {
    return fail(err);
  }
};

const getHandler = async (req) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");

    validateObjectId(profileId, "profileId");

    const data = await repo.findByProfile(profileId);

    return ok(data);
  } catch (err) {
    return fail(err);
  }
};

const updateHandler = async (req) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    validateObjectId(projectId, "projectId");

    const raw = await safeJson(req);
    const sanitized = sanitizeInput(raw);

    const result = await updateUC.execute(projectId, sanitized, req.user);

    auditLogger.log({
      action: "PROJECT_UPDATE",
      userId: req.user.id,
      resourceId: projectId,
    });

    return ok(result);
  } catch (err) {
    return fail(err);
  }
};

const deleteHandler = async (req) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    validateObjectId(projectId, "projectId");

    await deleteUC.execute(projectId);

    auditLogger.log({
      action: "PROJECT_DELETE",
      userId: req.user.id,
      resourceId: projectId,
    });

    return ok({ success: true });
  } catch (err) {
    return fail(err);
  }
};

const create = withRateLimit(
  withCsrf(authGuard(roleGuard(createHandler, ADMIN))),
  DEV
    ? { limit: 1000, window: 60, prefix: "project-create" }
    : { limit: 20, window: 60, prefix: "project-create" },
);

const update = withRateLimit(
  withCsrf(authGuard(roleGuard(updateHandler, ADMIN))),
  DEV
    ? { limit: 1000, window: 60, prefix: "project-update" }
    : { limit: 20, window: 60, prefix: "project-update" },
);

const remove = withRateLimit(
  withCsrf(authGuard(roleGuard(deleteHandler, ADMIN))),
  DEV
    ? { limit: 1000, window: 60, prefix: "project-delete" }
    : { limit: 10, window: 60, prefix: "project-delete" },
);

const get = withRateLimit(getHandler, {
  limit: 100,
  window: 60,
  prefix: "project-get",
});

export async function POST(req) {
  return create(req);
}

export async function GET(req) {
  return get(req);
}

export async function PATCH(req) {
  return update(req);
}

export async function DELETE(req) {
  return remove(req);
}
