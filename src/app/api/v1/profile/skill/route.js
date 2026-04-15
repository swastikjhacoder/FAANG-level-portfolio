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

import { cloudinaryService } from "@/modules/profile/infrastructure/services/cloudinary.service";

const useCase = new AddSkillUseCase();

const DEV = process.env.NODE_ENV === "development";
const ADMIN = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

const safeFormData = async (req) => {
  try {
    return await req.formData();
  } catch {
    throw new ValidationError("Invalid multipart/form-data");
  }
};

const parseFormData = (formData) => {
  const data = {};
  const files = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      files[key] = value;
    } else {
      data[key] = value;
    }
  }

  return { data, files };
};

const toUploadFile = async (file) => {
  const buffer = Buffer.from(await file.arrayBuffer());

  return {
    buffer,
    size: file.size,
    mimetype: file.type,
    originalname: file.name,
  };
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

    const formData = await safeFormData(req);
    const { data, files } = parseFormData(formData);

    if (files.icon) {
      const adapted = await toUploadFile(files.icon);

      const uploaded = await cloudinaryService.upload(adapted, "skill/icon");

      data.icon = {
        url: uploaded.url,
        publicId: uploaded.publicId,
      };
    }

    if (data.experience !== undefined) {
      data.experience = Number(data.experience);
    }

    if (data.proficiency !== undefined) {
      data.proficiency = Number(data.proficiency);
    }

    const sanitized = sanitizeInput(data);
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
    console.error("🔥 CREATE ERROR:", err);
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

    const existing = await SkillModel.findOne({
      _id: skillId,
      isDeleted: false,
    });

    if (!existing) throw new NotFoundError("Skill not found");

    const formData = await safeFormData(req);
    const { data, files } = parseFormData(formData);

    const update = {};

    if (data.name) update.name = data.name;
    if (data.experience !== undefined) {
      const exp = Number(data.experience);
      if (!Number.isNaN(exp)) update.experience = exp;
    }

    if (data.proficiency !== undefined) {
      const prof = Number(data.proficiency);
      if (!Number.isNaN(prof)) update.proficiency = prof;
    }

    if (files.icon) {
      const adapted = await toUploadFile(files.icon);

      const uploaded = await cloudinaryService.replace(
        existing?.icon?.publicId,
        adapted,
        "skill/icon",
      );

      update.icon = {
        url: uploaded.url,
        publicId: uploaded.publicId,
      };
    }

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

    auditLogger.log({
      action: "SKILL_UPDATE",
      userId: req.user.id,
      resourceId: skillId,
    });

    return ok(updated);
  } catch (err) {
    console.error("🔥 UPDATE ERROR:", err);
    return fail(err);
  }
};

const deleteHandler = async (req) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const skillId = searchParams.get("skillId");

    validateObjectId(skillId, "skillId");

    const existing = await SkillModel.findOne({
      _id: skillId,
      isDeleted: false,
    });

    if (!existing) throw new NotFoundError("Skill not found");

    if (existing?.icon?.publicId) {
      await cloudinaryService.delete(existing.icon.publicId);
    }

    await SkillModel.findOneAndUpdate(
      { _id: skillId, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
    );

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
