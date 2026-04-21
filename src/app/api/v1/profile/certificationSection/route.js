import connectDB from "@/shared/lib/db";

import { CertificationSectionRepository } from "@/modules/profile/infrastructure/persistence/certificationSection.repository";
import { UpsertCertificationSectionUseCase } from "@/modules/profile/application/useCases/upsertCertificationSection.usecase";

import { certificationSectionDTO } from "@/modules/profile/application/dto/certificationSection.dto";

import { sanitizeInput } from "@/shared/security/sanitizers/input.sanitizer";
import { ValidationError } from "@/shared/errors";

import { authGuard } from "@/modules/auth/security/guards/auth.guard";
import { roleGuard } from "@/modules/auth/security/guards/role.guard";

import { ROLES } from "@/shared/constants/roles";

import withRateLimit from "@/shared/security/middleware/rateLimit.middleware";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";

import { CertificationSectionModel } from "@/modules/profile/infrastructure/persistence/certificationSection.schema";

const repo = new CertificationSectionRepository();
const useCase = new UpsertCertificationSectionUseCase(repo);

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

    return ok(
      section || {
        heading: "Certifications",
        subHeading: "My certifications",
        description: "List of certifications I have achieved.",
      },
    );
  } catch (err) {
    return fail(err);
  }
};

const postHandler = async (req) => {
  try {
    await connectDB();

    const existing = await repo.get();
    if (existing) {
      throw new ValidationError("Section already exists. Use PUT to update.");
    }

    const raw = await req.json();
    const sanitized = sanitizeInput(raw);
    const validated = certificationSectionDTO.parse(sanitized);

    const result = await useCase.execute(validated, req.user);

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
    const validated = certificationSectionDTO.parse(sanitized);

    const result = await useCase.execute(validated, req.user);

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

    if (!raw || typeof raw !== "object") {
      throw new ValidationError("Invalid payload");
    }

    const updateFields = {};

    ["heading", "subHeading", "description"].forEach((key) => {
      if (sanitized[key] !== undefined) {
        updateFields[key] = sanitized[key];
      }
    });

    if (!Object.keys(updateFields).length) {
      throw new ValidationError("No valid fields to update");
    }

    const result = await CertificationSectionModel.findOneAndUpdate(
      { key: "certification" },
      {
        $set: {
          ...updateFields,
          updatedBy: req.user.id,
          updatedAt: new Date(),
        },
      },
      { new: true },
    ).lean();

    return ok(result);
  } catch (err) {
    return fail(err);
  }
};

const deleteHandler = async () => {
  try {
    await connectDB();

    await CertificationSectionModel.findOneAndDelete({
      key: "certification",
    });

    return ok({ success: true });
  } catch (err) {
    return fail(err);
  }
};

export const GET = withRateLimit(
  getHandler,
  DEV ? { limit: 1000, window: 60 } : { limit: 100, window: 60 },
);

export const POST = withRateLimit(
  withCsrf(authGuard(roleGuard(postHandler, ADMIN))),
  DEV ? { limit: 1000, window: 60 } : { limit: 20, window: 60 },
);

export const PUT = withRateLimit(
  withCsrf(authGuard(roleGuard(putHandler, ADMIN))),
  DEV ? { limit: 1000, window: 60 } : { limit: 20, window: 60 },
);

export const PATCH = withRateLimit(
  withCsrf(authGuard(roleGuard(patchHandler, ADMIN))),
  DEV ? { limit: 1000, window: 60 } : { limit: 20, window: 60 },
);

export const DELETE = withRateLimit(
  withCsrf(authGuard(roleGuard(deleteHandler, ADMIN))),
  DEV ? { limit: 1000, window: 60 } : { limit: 10, window: 60 },
);
