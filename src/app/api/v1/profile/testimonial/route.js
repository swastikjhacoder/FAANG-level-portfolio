import connectDB from "@/shared/lib/db";

import withRateLimit from "@/shared/security/middleware/rateLimit.middleware";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";

import { sanitizeInput } from "@/shared/security/sanitizers/input.sanitizer";

import { AddTestimonialUseCase } from "@/modules/profile/application/useCases/addTestimonial.usecase";
import { ApproveTestimonialUseCase } from "@/modules/profile/application/useCases/approveTestimonial.usecase";
import { DeleteTestimonialUseCase } from "@/modules/profile/application/useCases/deleteTestimonial.usecase";

import { TestimonialRepository } from "@/modules/profile/infrastructure/persistence/testimonial.repository";

import { authGuard } from "@/modules/auth/security/guards/auth.guard";
import { roleGuard } from "@/modules/auth/security/guards/role.guard";

import { ROLES } from "@/shared/constants/roles";

import { validateObjectId } from "@/shared/utils/validateObjectId";
import { ValidationError } from "@/shared/errors";
import auditLogger from "@/shared/security/audit/audit.logger";

const repo = new TestimonialRepository();

const createUC = new AddTestimonialUseCase(repo);
const approveUC = new ApproveTestimonialUseCase(repo);
const deleteUC = new DeleteTestimonialUseCase(repo);

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

    const result = await createUC.execute(sanitized, req.user);

    auditLogger.log({
      action: "TESTIMONIAL_CREATE",
      userId: req.user?.id,
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

    const data = await repo.findApprovedByProfile(profileId);

    return ok(data);
  } catch (err) {
    return fail(err);
  }
};

const approveHandler = async (req) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("testimonialId");

    validateObjectId(id, "testimonialId");

    const result = await approveUC.execute(id, req.user);

    auditLogger.log({
      action: "TESTIMONIAL_APPROVE",
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
    const id = searchParams.get("testimonialId");

    validateObjectId(id, "testimonialId");

    await deleteUC.execute(id);

    auditLogger.log({
      action: "TESTIMONIAL_DELETE",
      userId: req.user.id,
      resourceId: id,
    });

    return ok({ success: true });
  } catch (err) {
    return fail(err);
  }
};

const create = withRateLimit(
  withCsrf(authGuard(createHandler)),
  DEV ? { limit: 1000, window: 60 } : { limit: 10, window: 60 },
);

const approve = withRateLimit(
  withCsrf(authGuard(roleGuard(approveHandler, ADMIN))),
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
  return approve(req);
}

export async function DELETE(req) {
  return remove(req);
}
