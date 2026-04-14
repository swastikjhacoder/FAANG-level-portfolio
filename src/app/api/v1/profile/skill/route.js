import connectDB from "@/shared/lib/db";

import { withRateLimit } from "@/shared/security/middleware/rateLimit.middleware";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";

import { sanitizeInput } from "@/shared/security/sanitizers/input.sanitizer";

import { addSkillDTO } from "@/modules/profile/application/dto/addSkill.dto";
import { AddSkillUseCase } from "@/modules/profile/application/useCases/addSkill.usecase";

import { SkillModel } from "@/modules/profile/infrastructure/persistence/skill.schema";

import { authGuard } from "@/modules/auth/security/guards/auth.guard";
import { roleGuard } from "@/modules/auth/security/guards/role.guard";

import { ROLES } from "@/shared/constants/roles";

import { validateObjectId } from "@/shared/utils/validateObjectId";
import { ValidationError, NotFoundError } from "@/shared/errors";
import auditLogger from "@/shared/security/audit/audit.logger";

const useCase = new AddSkillUseCase();

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
    const validated = addSkillDTO.parse(sanitized);

    validateObjectId(validated.profileId, "profileId");

    const result = await useCase.execute(validated, req.user);

    auditLogger.log({
      action: "SKILL_CREATE",
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

    const skills = await SkillModel.find({
      profileId,
      isDeleted: false,
    }).lean();

    return ok(skills);
  } catch (err) {
    return fail(err);
  }
};

const updateHandler = async (req) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const skillId = searchParams.get("skillId");

    validateObjectId(skillId, "skillId");

    const raw = await safeJson(req);
    const sanitized = sanitizeInput(raw);

    const update = {};

    if (sanitized.name) update.name = sanitized.name;
    if (sanitized.experience !== undefined)
      update.experience = sanitized.experience;
    if (sanitized.proficiency !== undefined)
      update.proficiency = sanitized.proficiency;

    if (Object.keys(update).length === 0) {
      throw new ValidationError("No valid fields to update");
    }

    const updated = await SkillModel.findOneAndUpdate(
      { _id: skillId, isDeleted: false },
      {
        ...update,
        updatedBy: req.user.id,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true },
    ).lean();

    if (!updated) throw new NotFoundError("Skill not found");

    auditLogger.log({
      action: "SKILL_UPDATE",
      userId: req.user.id,
      resourceId: skillId,
    });

    return ok(updated);
  } catch (err) {
    return fail(err);
  }
};

const deleteHandler = async (req) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const skillId = searchParams.get("skillId");

    validateObjectId(skillId, "skillId");

    const deleted = await SkillModel.findOneAndUpdate(
      { _id: skillId, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true },
    ).lean();

    if (!deleted) throw new NotFoundError("Skill not found");

    auditLogger.log({
      action: "SKILL_DELETE",
      userId: req.user.id,
      resourceId: skillId,
    });

    return ok({ success: true });
  } catch (err) {
    return fail(err);
  }
};

const create = withRateLimit(
  withCsrf(authGuard(roleGuard(createHandler, ADMIN))),
  DEV
    ? { limit: 1000, window: 60, prefix: "skill-create" }
    : { limit: 30, window: 60, prefix: "skill-create" },
);

const update = withRateLimit(
  withCsrf(authGuard(roleGuard(updateHandler, ADMIN))),
  DEV
    ? { limit: 1000, window: 60, prefix: "skill-update" }
    : { limit: 30, window: 60, prefix: "skill-update" },
);

const remove = withRateLimit(
  withCsrf(authGuard(roleGuard(deleteHandler, ADMIN))),
  DEV
    ? { limit: 1000, window: 60, prefix: "skill-delete" }
    : { limit: 20, window: 60, prefix: "skill-delete" },
);

const get = withRateLimit(getHandler, {
  limit: 100,
  window: 60,
  prefix: "skill-get",
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
