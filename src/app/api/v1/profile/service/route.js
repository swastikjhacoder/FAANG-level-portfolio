import connectDB from "@/shared/lib/db";

import withRateLimit from "@/shared/security/middleware/rateLimit.middleware";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";

import { sanitizeInput } from "@/shared/security/sanitizers/input.sanitizer";

import { AddServiceUseCase } from "@/modules/profile/application/useCases/addService.usecase";
import { UpdateServiceUseCase } from "@/modules/profile/application/useCases/updateService.usecase";
import { DeleteServiceUseCase } from "@/modules/profile/application/useCases/deleteService.usecase";

import { ServiceRepository } from "@/modules/profile/infrastructure/persistence/service.repository";

import { authGuard } from "@/modules/auth/security/guards/auth.guard";
import { roleGuard } from "@/modules/auth/security/guards/role.guard";

import { ROLES } from "@/shared/constants/roles";

import { validateObjectId } from "@/shared/utils/validateObjectId";
import { ValidationError } from "@/shared/errors";
import auditLogger from "@/shared/security/audit/audit.logger";

import { cloudinaryService } from "@/modules/profile/infrastructure/services/cloudinary.service";

const repo = new ServiceRepository();

const createUC = new AddServiceUseCase(repo);
const updateUC = new UpdateServiceUseCase(repo);
const deleteUC = new DeleteServiceUseCase(repo);

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

      const uploaded = await cloudinaryService.upload(adapted, "service/icon");

      data.icon = {
        url: uploaded.url,
        publicId: uploaded.publicId,
      };
    }

    validateObjectId(data.profileId, "profileId");

    const sanitized = sanitizeInput(data);

    const result = await createUC.execute(sanitized, req.user);

    auditLogger.log({
      action: "SERVICE_CREATE",
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
    const id = searchParams.get("serviceId");

    validateObjectId(id, "serviceId");

    const existing = await repo.findById(id);

    const formData = await safeFormData(req);
    const { data, files } = parseFormData(formData);

    if (files.icon) {
      const adapted = await toUploadFile(files.icon);

      const uploaded = await cloudinaryService.replace(
        existing?.icon?.publicId,
        adapted,
        "service/icon",
      );

      data.icon = {
        url: uploaded.url,
        publicId: uploaded.publicId,
      };
    }

    const sanitized = sanitizeInput(data);

    const result = await updateUC.execute(id, sanitized, req.user);

    auditLogger.log({
      action: "SERVICE_UPDATE",
      userId: req.user.userId,
      resourceId: id,
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
    const id = searchParams.get("serviceId");

    validateObjectId(id, "serviceId");

    const existing = await repo.findById(id);

    if (existing?.icon?.publicId) {
      await cloudinaryService.delete(existing.icon.publicId);
    }

    await deleteUC.execute(id);

    auditLogger.log({
      action: "SERVICE_DELETE",
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
  ? getHandler
  : withRateLimit(getHandler, {
      limit: 100,
      window: 60,
      key: rateKey,
    });

const create = DEV
  ? withCsrf(authGuard(roleGuard(createHandler, ADMIN)))
  : withRateLimit(withCsrf(authGuard(roleGuard(createHandler, ADMIN))), {
      limit: 20,
      window: 60,
      key: rateKey,
    });

const update = DEV
  ? withCsrf(authGuard(roleGuard(updateHandler, ADMIN)))
  : withRateLimit(withCsrf(authGuard(roleGuard(updateHandler, ADMIN))), {
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
  return update(req);
}

export async function DELETE(req) {
  return remove(req);
}
