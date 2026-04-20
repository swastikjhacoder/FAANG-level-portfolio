import connectDB from "@/shared/lib/db";

import withRateLimit from "@/shared/security/middleware/rateLimit.middleware";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";

import { sanitizeInput } from "@/shared/security/sanitizers/input.sanitizer";

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

import { cloudinaryService } from "@/modules/profile/infrastructure/services/cloudinary.service";

const repo = new ProjectRepository();

const createUC = new AddProjectUseCase(repo);
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

    if (data.techStack) data.techStack = JSON.parse(data.techStack);
    if (data.description) data.description = JSON.parse(data.description);

    if (files.screenshot) {
      const adapted = await toUploadFile(files.screenshot);

      const uploaded = await cloudinaryService.upload(
        adapted,
        "project/screenshot",
      );

      data.screenshot = {
        url: uploaded.url,
        publicId: uploaded.publicId,
      };
    }

    if (Array.isArray(data.techStack)) {
      for (let i = 0; i < data.techStack.length; i++) {
        const file = files[`techIcon_${i}`];

        if (file) {
          const adapted = await toUploadFile(file);

          const uploaded = await cloudinaryService.upload(
            adapted,
            "project/tech",
          );

          data.techStack[i].icon = {
            url: uploaded.url,
            publicId: uploaded.publicId,
          };
        }
      }
    }

    validateObjectId(data.profileId, "profileId");

    const sanitized = sanitizeInput(data);

    const result = await createUC.execute(sanitized, req.user);

    auditLogger.log({
      action: "PROJECT_CREATE",
      userId: req.user.userId,
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

    const existing = await repo.findById(projectId);

    const formData = await safeFormData(req);
    const { data, files } = parseFormData(formData);

    if (data.techStack) data.techStack = JSON.parse(data.techStack);
    if (data.description) data.description = JSON.parse(data.description);

    if (files.screenshot) {
      const adapted = await toUploadFile(files.screenshot);

      const uploaded = await cloudinaryService.replace(
        existing?.screenshot?.publicId,
        adapted,
        "project/screenshot",
      );

      data.screenshot = {
        url: uploaded.url,
        publicId: uploaded.publicId,
      };
    }

    if (Array.isArray(data.techStack)) {
      for (let i = 0; i < data.techStack.length; i++) {
        const file = files[`techIcon_${i}`];

        if (file) {
          const adapted = await toUploadFile(file);

          const old = existing?.techStack?.[i]?.icon?.publicId;

          const uploaded = await cloudinaryService.replace(
            old,
            adapted,
            "project/tech",
          );

          data.techStack[i].icon = {
            url: uploaded.url,
            publicId: uploaded.publicId,
          };
        } else {
          data.techStack[i].icon = existing?.techStack?.[i]?.icon || null;
        }
      }
    }

    const sanitized = sanitizeInput(data);

    const result = await updateUC.execute(projectId, sanitized, req.user);

    auditLogger.log({
      action: "PROJECT_UPDATE",
      userId: req.user.userId,
      resourceId: projectId,
    });

    return ok(result);
  } catch (err) {
    console.error("🔥 UPDATE ERROR:", err);
    return fail(err);
  }
};

const deleteHandler = async (req) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    validateObjectId(projectId, "projectId");

    const existing = await repo.findById(projectId);

    if (existing?.screenshot?.publicId) {
      await cloudinaryService.delete(existing.screenshot.publicId);
    }

    if (existing?.techStack?.length) {
      for (const tech of existing.techStack) {
        if (tech?.icon?.publicId) {
          await cloudinaryService.delete(tech.icon.publicId);
        }
      }
    }

    await deleteUC.execute(projectId);

    auditLogger.log({
      action: "PROJECT_DELETE",
      userId: req.user.userId,
      resourceId: projectId,
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
