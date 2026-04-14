import connectDB from "@/shared/lib/db";

import { withRateLimit } from "@/shared/security/middleware/rateLimit.middleware";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";

import { sanitizeInput } from "@/shared/security/sanitizers/input.sanitizer";

import { addCertificationDTO } from "@/modules/profile/application/dto/addCertification.dto";

import { AddCertificationUseCase } from "@/modules/profile/application/useCases/addCertification.usecase";
import { UpdateCertificationUseCase } from "@/modules/profile/application/useCases/updateCertification.usecase";
import { DeleteCertificationUseCase } from "@/modules/profile/application/useCases/deleteCertification.usecase";

import { CertificationRepository } from "@/modules/profile/infrastructure/persistence/certification.repository";

import { authGuard } from "@/modules/auth/security/guards/auth.guard";
import { roleGuard } from "@/modules/auth/security/guards/role.guard";

import { ROLES } from "@/shared/constants/roles";

import { validateObjectId } from "@/shared/utils/validateObjectId";
import { ValidationError } from "@/shared/errors";
import auditLogger from "@/shared/security/audit/audit.logger";

const repo = new CertificationRepository();

const createUC = new AddCertificationUseCase(repo);
const updateUC = new UpdateCertificationUseCase(repo);
const deleteUC = new DeleteCertificationUseCase(repo);

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

const createHandler = async (req) => {
  try {
    await connectDB();

    const raw = await safeJson(req);
    const sanitized = sanitizeInput(raw);

    const validated = addCertificationDTO.parse(sanitized);

    const result = await createUC.execute(validated, req.user);

    auditLogger.log({
      action: "CERTIFICATION_CREATE",
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
    const id = searchParams.get("certificationId");

    validateObjectId(id, "certificationId");

    const raw = await safeJson(req);
    const sanitized = sanitizeInput(raw);

    const result = await updateUC.execute(id, sanitized, req.user);

    auditLogger.log({
      action: "CERTIFICATION_UPDATE",
      userId: req.user.id,
      resourceId: id,
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
    const id = searchParams.get("certificationId");

    validateObjectId(id, "certificationId");

    await deleteUC.execute(id);

    auditLogger.log({
      action: "CERTIFICATION_DELETE",
      userId: req.user.id,
      resourceId: id,
    });

    return ok({ success: true });
  } catch (err) {
    return fail(err);
  }
};

const create = withRateLimit(
  withCsrf(authGuard(roleGuard(createHandler, ADMIN))),
  DEV ? { limit: 1000, window: 60 } : { limit: 20, window: 60 },
);

const update = withRateLimit(
  withCsrf(authGuard(roleGuard(updateHandler, ADMIN))),
  DEV ? { limit: 1000, window: 60 } : { limit: 20, window: 60 },
);

const remove = withRateLimit(
  withCsrf(authGuard(roleGuard(deleteHandler, ADMIN))),
  DEV ? { limit: 1000, window: 60 } : { limit: 10, window: 60 },
);

const get = withRateLimit(getHandler, {
  limit: 100,
  window: 60,
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
