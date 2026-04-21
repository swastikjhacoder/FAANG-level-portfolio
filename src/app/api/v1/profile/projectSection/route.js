import connectDB from "@/shared/lib/db";

import { ProjectSectionRepository } from "@/modules/profile/infrastructure/persistence/projectSection.repository";
import { AddProjectSectionUseCase } from "@/modules/profile/application/useCases/addProjectSection.usecase";

import { AddProjectSectionDTO } from "@/modules/profile/application/dto/addProjectSection.dto";
import { UpdateProjectSectionDTO } from "@/modules/profile/application/dto/updateProjectSection.dto";

import { sanitizeInput } from "@/shared/security/sanitizers/input.sanitizer";
import { ValidationError } from "@/shared/errors";

import { authGuard } from "@/modules/auth/security/guards/auth.guard";
import { roleGuard } from "@/modules/auth/security/guards/role.guard";

import { ROLES } from "@/shared/constants/roles";

import withRateLimit from "@/shared/security/middleware/rateLimit.middleware";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";

import { ProjectSectionModel } from "@/modules/profile/infrastructure/persistence/projectSection.schema";

const repo = new ProjectSectionRepository();
const useCase = new AddProjectSectionUseCase(repo);

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

const getHandler = async (req) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      throw new ValidationError("profileId is required");
    }

    const section = await repo.findByProfileId(profileId);

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

    const dto = AddProjectSectionDTO.validate(sanitized);

    const existing = await repo.findByProfileId(dto.profileId);
    if (existing) {
      throw new ValidationError("Section already exists. Use PUT to update.");
    }

    const result = await useCase.execute(dto, req.user);

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

    const dto = AddProjectSectionDTO.validate(sanitized);

    const result = await useCase.execute(dto, req.user);

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

    if (!sanitized.profileId) {
      throw new ValidationError("profileId is required");
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

    const result = await ProjectSectionModel.findOneAndUpdate(
      { profileId: sanitized.profileId },
      {
        $set: {
          ...updateFields,
          updatedBy: req.user.id,
          updatedAt: new Date(),
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

const deleteHandler = async (req) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      throw new ValidationError("profileId is required");
    }

    await ProjectSectionModel.deleteOne({ profileId });

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
