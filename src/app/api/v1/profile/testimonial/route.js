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
import { cloudinaryService } from "@/modules/profile/infrastructure/services/cloudinary.service";

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

    const formData = await req.formData();

    const payload = {
      profileId: formData.get("profileId"),
      quote: formData.get("quote"),
      senderName: formData.get("senderName"),
      senderRole: formData.get("senderRole"),
      company: formData.get("company"),
    };

    const file = formData.get("senderImage");

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const uploaded = await cloudinaryService.upload(
        {
          buffer,
          size: file.size,
          mimetype: file.type,
          originalname: file.name,
        },
        "testimonials",
      );

      payload.senderImage = uploaded;
    }

    const sanitized = sanitizeInput(payload);

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
    const isAdmin = searchParams.get("admin") === "true";

    validateObjectId(profileId, "profileId");

    let data;

    if (isAdmin) {
      data = await repo.findAllByProfile(profileId);
    } else {
      data = await repo.findApprovedByProfile(profileId);
    }

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
      userId: req.user.userId,
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
      userId: req.user.userId,
      resourceId: id,
    });

    return ok({ success: true });
  } catch (err) {
    return fail(err);
  }
};

const rateKey = (req) => `rate:${req.ip}:${req.method}:${req.nextUrl.pathname}`;

const get = DEV
  ? async (req) => {
      const url = new URL(req.url);
      const isAdmin = url.searchParams.get("admin") === "true";

      if (isAdmin) {
        return authGuard(roleGuard(getHandler, ADMIN))(req);
      }
      return getHandler(req);
    }
  : withRateLimit(
      async (req) => {
        const url = new URL(req.url);
        const isAdmin = url.searchParams.get("admin") === "true";

        if (isAdmin) {
          return authGuard(roleGuard(getHandler, ADMIN))(req);
        }
        return getHandler(req);
      },
      { limit: 100, window: 60, key: rateKey },
    );

const create = DEV
  ? withCsrf(authGuard(createHandler))
  : withRateLimit(withCsrf(authGuard(createHandler)), {
      limit: 10,
      window: 60,
      key: rateKey,
    });

const approve = DEV
  ? withCsrf(authGuard(roleGuard(approveHandler, ADMIN)))
  : withRateLimit(withCsrf(authGuard(roleGuard(approveHandler, ADMIN))), {
      limit: 20,
      window: 60,
      key: rateKey,
    });

const remove = DEV
  ? withCsrf(authGuard(roleGuard(deleteHandler, ADMIN)))
  : withRateLimit(withCsrf(authGuard(roleGuard(deleteHandler, ADMIN))), {
      limit: 10,
      window: 60,
      key: rateKey,
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
