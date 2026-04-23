import connectDB from "@/shared/lib/db";

import withRateLimit from "@/shared/security/middleware/rateLimit.middleware";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";

import { sanitizeInput } from "@/shared/security/sanitizers/input.sanitizer";

import { createProfileDTO } from "@/modules/profile/application/dto/createProfile.dto";
import { updateProfileDTO } from "@/modules/profile/application/dto/updateProfile.dto";

import { authGuard } from "@/modules/auth/security/guards/auth.guard";
import { roleGuard } from "@/modules/auth/security/guards/role.guard";

import { ROLES } from "@/shared/constants/roles";

import { ProfileService } from "@/modules/profile/application/services/profile.service";

import { validateObjectId } from "@/shared/utils/validateObjectId";
import { ValidationError } from "@/shared/errors";
import auditLogger from "@/shared/security/audit/audit.logger";
import { extractRequestMeta } from "@/shared/utils/requestMeta";

const service = new ProfileService();

const ADMIN_ROLES = [ROLES.ADMIN, ROLES.SUPER_ADMIN];
const DEV = process.env.NODE_ENV === "development";

const safeJson = async (req) => {
  try {
    return await req.json();
  } catch {
    throw new ValidationError("Invalid JSON body");
  }
};

const ok = (data) => Response.json({ success: true, data });

const fail = (req, error) => {
  const meta = extractRequestMeta(req);

  console.error("🔥 PROFILE ERROR:", {
    ...meta,
    message: error.message,
    stack: error.stack,
    code: error.code,
  });

  let status = error.status || 500;
  let message = "Internal Server Error";
  let code = "INTERNAL_ERROR";

  if (error.name === "ZodError") {
    status = 400;
    message = error.errors?.[0]?.message || "Validation failed";
    code = "BAD_USER_INPUT";
  } else if (error.name === "ValidationError") {
    status = 400;
    message = error.message;
    code = "BAD_USER_INPUT";
  } else if (error.name === "NotFoundError") {
    status = 404;
    message = error.message;
    code = "NOT_FOUND";
  } else if (error.message === "Forbidden") {
    status = 403;
    message = "Forbidden";
    code = "FORBIDDEN";
  } else if (error.message === "Unauthorized") {
    status = 401;
    message = "Unauthorized";
    code = "UNAUTHORIZED";
  } else if (error.code === 11000) {
    status = 409;
    message = "Duplicate resource";
    code = "CONFLICT";
  }

  if (!DEV && status === 500) {
    message = "Something went wrong";
  } else if (DEV && status === 500) {
    message = error.message;
  }

  return Response.json({ success: false, message, code }, { status });
};

const parseMultipart = async (req) => {
  const formData = await req.formData();
  const data = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      data[key] = value;
      continue;
    }

    if (key.endsWith("[]")) {
      const cleanKey = key.replace("[]", "");
      if (!data[cleanKey]) data[cleanKey] = [];
      data[cleanKey].push(value);
      continue;
    }

    try {
      data[key] = JSON.parse(value);
    } catch {
      data[key] = value;
    }
  }

  return data;
};

const getRequestBody = async (req) => {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    return parseMultipart(req);
  }

  return safeJson(req);
};

const createHandler = async (req) => {
  try {
    await connectDB();

    const raw = await getRequestBody(req);

    const profileImageFile = raw.profileImage;

    delete raw.profileImage;

    const sanitized = sanitizeInput(raw);

    const validated = createProfileDTO.parse({
      ...sanitized,
      profileImage: undefined,
    });

    const result = await service.createProfile(
      {
        ...validated,
        profileImage: profileImageFile,
      },
      req.user,
    );

    auditLogger.log({
      action: "PROFILE_CREATE",
      userId: req.user.userId,
      resourceId: result._id,
    });

    return ok(result);
  } catch (err) {
    return fail(req, err);
  }
};

const getHandler = async (req) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const safeNumber = (val, def) => {
      const n = Number(val);
      return Number.isFinite(n) && n > 0 ? n : def;
    };

    const page = safeNumber(searchParams.get("page"), 1);
    const limit = Math.min(safeNumber(searchParams.get("limit"), 10), 50);

    auditLogger.log({
      action: "PROFILE_LIST",
      userId: req.user?.id || null,
      meta: { page, limit },
    });

    const result = await service.listProfiles({ page, limit });

    return ok(result);
  } catch (err) {
    return fail(err);
  }
};

const updateHandler = async (req) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");

    validateObjectId(profileId, "profileId");

    const raw = await getRequestBody(req);

    const profileImageFile = raw.profileImage;
    delete raw.profileImage;

    const sanitized = sanitizeInput(raw);

    const validated = updateProfileDTO.parse({
      ...sanitized,
      profileImage: undefined,
    });

    const result = await service.updateProfile(
      profileId,
      {
        ...validated,
        profileImage: profileImageFile,
      },
      req.user,
    );

    auditLogger.log({
      action: "PROFILE_UPDATE",
      userId: req.user.userId,
      resourceId: profileId,
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
    const profileId = searchParams.get("profileId");

    validateObjectId(profileId, "profileId");

    await service.deleteProfile(profileId, req.user);

    auditLogger.log({
      action: "PROFILE_DELETE",
      userId: req.user.userId,
      resourceId: profileId,
    });

    return ok(true);
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
  ? withCsrf(authGuard(roleGuard(createHandler, ADMIN_ROLES)))
  : withRateLimit(withCsrf(authGuard(roleGuard(createHandler, ADMIN_ROLES))), {
      limit: 10,
      window: 60,
      key: rateKey,
    });

const update = DEV
  ? withCsrf(authGuard(roleGuard(updateHandler, ADMIN_ROLES)))
  : withRateLimit(withCsrf(authGuard(roleGuard(updateHandler, ADMIN_ROLES))), {
      limit: 20,
      window: 60,
      key: rateKey,
    });

const remove = DEV
  ? withCsrf(authGuard(roleGuard(deleteHandler, ADMIN_ROLES)))
  : withRateLimit(withCsrf(authGuard(roleGuard(deleteHandler, ADMIN_ROLES))), {
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
