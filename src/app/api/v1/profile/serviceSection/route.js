import connectDB from "@/shared/lib/db";

import { ServiceSectionRepository } from "@/modules/profile/infrastructure/persistence/serviceSection.repository";
import { ServiceSectionUseCase } from "@/modules/profile/application/useCases/serviceSection.usecase";

import { serviceSectionDTO } from "@/modules/profile/application/dto/addOrUpdateServiceSection.dto";

import { sanitizeInput } from "@/shared/security/sanitizers/input.sanitizer";
import { ValidationError } from "@/shared/errors";

import { authGuard } from "@/modules/auth/security/guards/auth.guard";
import { roleGuard } from "@/modules/auth/security/guards/role.guard";

import { ROLES } from "@/shared/constants/roles";

import withRateLimit from "@/shared/security/middleware/rateLimit.middleware";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";

import { ServiceSectionModel } from "@/modules/profile/infrastructure/persistence/serviceSection.schema";

const repo = new ServiceSectionRepository();
const useCase = new ServiceSectionUseCase(repo);

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

    const dto = serviceSectionDTO.parse(sanitized);

    const existing = await repo.get();
    if (existing) {
      throw new ValidationError("Section already exists. Use PUT to update.");
    }

    const result = await useCase.upsertSection(dto, req.user);

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

    const dto = serviceSectionDTO.parse(sanitized);

    const result = await useCase.upsertSection(dto, req.user);

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

    const result = await ServiceSectionModel.findOneAndUpdate(
      {},
      {
        $set: {
          ...updateFields,
          updatedAt: new Date(),
          updatedBy: req.user.id,
        },
      },
      { new: true },
    ).lean();

    if (!result) {
      throw new ValidationError("Section not found. Please create it first.");
    }

    return ok(result);
  } catch (err) {
    return fail(err);
  }
};

const deleteHandler = async () => {
  try {
    await connectDB();
    await ServiceSectionModel.deleteOne({});
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