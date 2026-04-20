import connectDB from "@/shared/lib/db";

import withRateLimit from "@/shared/security/middleware/rateLimit.middleware";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";

import { sanitizeInput } from "@/shared/security/sanitizers/input.sanitizer";

import { addCertificationDTO } from "@/modules/profile/application/dto/addCertification.dto";

import { AddCertificationUseCase } from "@/modules/profile/application/useCases/addCertification.usecase";
import { UpdateCertificationUseCase } from "@/modules/profile/application/useCases/updateCertification.usecase";
import { DeleteCertificationUseCase } from "@/modules/profile/application/useCases/deleteCertification.usecase";

import { CertificationRepository } from "@/modules/profile/infrastructure/persistence/certification.repository";

import { authGuard } from "@/modules/auth/security/guards/auth.guard";
import { roleGuard } from "@/modules/auth/security/guards/role.guard";

import { ROLES } from "@/shared/constants/roles";

import { validateObjectId } from "@/shared/utils/validateObjectId";
import { ValidationError } from "@/shared/errors";
import auditLogger from "@/shared/security/audit/audit.logger";

import { CertificationSectionRepository } from "@/modules/profile/infrastructure/persistence/certificationSection.repository";
import { UpsertCertificationSectionUseCase } from "@/modules/profile/application/useCases/upsertCertificationSection.usecase";

import { updateCertificationDTO } from "@/modules/profile/application/dto/updateCertification.dto";
import { certificationSectionDTO } from "@/modules/profile/application/dto/certificationSection.dto";

import { cloudinaryService } from "@/modules/profile/infrastructure/services/cloudinary.service";

const repo = new CertificationRepository();

const createUC = new AddCertificationUseCase(repo);
const updateUC = new UpdateCertificationUseCase(repo);
const deleteUC = new DeleteCertificationUseCase(repo);
const sectionRepo = new CertificationSectionRepository();
const sectionUC = new UpsertCertificationSectionUseCase(sectionRepo);

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

const sectionHandler = async (req) => {
  try {
    await connectDB();

    if (!req.headers.get("content-type")?.includes("application/json")) {
      throw new ValidationError("Content-Type must be application/json");
    }

    let raw;

    try {
      raw = await req.json();
    } catch {
      throw new ValidationError("Invalid or empty JSON body");
    }

    if (!raw || typeof raw !== "object") {
      throw new ValidationError("Invalid payload");
    }

    if ("content" in raw) {
      throw new ValidationError("Content not allowed in section update");
    }

    const sanitized = sanitizeInput(raw);
    const validated = certificationSectionDTO.parse(sanitized);

    const result = await sectionUC.execute(validated, req.user);

    return ok(result);
  } catch (err) {
    return fail(err);
  }
};

const section = withRateLimit(
  withCsrf(authGuard(roleGuard(sectionHandler, ADMIN))),
  DEV ? { limit: 1000, window: 60 } : { limit: 20, window: 60 },
);

const createHandler = async (req) => {
  try {
    await connectDB();

    if (!req.headers.get("content-type")?.includes("multipart/form-data")) {
      throw new ValidationError("Content-Type must be multipart/form-data");
    }

    const formData = await req.formData();

    const file = formData.get("file");
    const rawData = formData.get("data");

    if (!rawData) {
      throw new ValidationError("Missing data payload");
    }

    let parsed;
    try {
      parsed = JSON.parse(rawData);
    } catch {
      throw new ValidationError("Invalid JSON in data field");
    }

    if ("heading" in parsed) {
      throw new ValidationError("Invalid field for this operation");
    }

    const sanitized = sanitizeInput(parsed);
    const validated = addCertificationDTO.parse(sanitized);

    validateObjectId(validated.profileId, "profileId");

    let certificateData = {};

    if (file && typeof file === "object") {
      const uploaded = await cloudinaryService.upload(
        {
          buffer: Buffer.from(await file.arrayBuffer()),
          size: file.size,
          mimetype: file.type,
          originalname: file.name,
        },
        "certifications",
      );

      certificateData = {
        certificateDownloadUrl: uploaded.url,
        certificatePublicId: uploaded.publicId,
      };
    }

    const result = await createUC.execute(
      {
        profileId: validated.profileId,
        content: {
          ...validated.content,
          ...certificateData,
        },
      },
      req.user,
    );

    auditLogger.log({
      action: "CERTIFICATION_CREATE",
      userId: req.user.userId,
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

    const [section, items] = await Promise.all([
      sectionRepo.get(),
      repo.findByProfile(profileId),
    ]);

    return ok({
      section,
      certifications: items,
    });
  } catch (err) {
    return fail(err);
  }
};

const updateHandler = async (req) => {
  try {
    await connectDB();

    if (!req.headers.get("content-type")?.includes("multipart/form-data")) {
      throw new ValidationError("Content-Type must be multipart/form-data");
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("certificationId");

    validateObjectId(id, "certificationId");

    const formData = await req.formData();

    const file = formData.get("file");
    const rawData = formData.get("data");

    if (!rawData) {
      throw new ValidationError("Missing data payload");
    }

    let parsed;
    try {
      parsed = JSON.parse(rawData);
    } catch {
      throw new ValidationError("Invalid JSON in data field");
    }

    if ("heading" in parsed) {
      throw new ValidationError("Invalid field for this operation");
    }

    const sanitized = sanitizeInput(parsed);
    const validated = updateCertificationDTO.parse(sanitized);

    if (
      !file &&
      (!validated.content || !Object.keys(validated.content).length)
    ) {
      throw new ValidationError("No valid fields to update");
    }

    let certificateData = {};

    if (file && typeof file === "object") {
      const existing = await repo.findById(id);

      const uploaded = await cloudinaryService.replace(
        existing?.content?.certificatePublicId,
        {
          buffer: Buffer.from(await file.arrayBuffer()),
          size: file.size,
          mimetype: file.type,
          originalname: file.name,
        },
        "certifications",
      );

      certificateData = {
        certificateDownloadUrl: uploaded.url,
        certificatePublicId: uploaded.publicId,
      };
    }

    const result = await updateUC.execute(
      id,
      {
        content: {
          ...validated.content,
          ...certificateData,
        },
      },
      req.user,
    );

    auditLogger.log({
      action: "CERTIFICATION_UPDATE",
      userId: req.user.userId,
      resourceId: result._id,
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
    const id = searchParams.get("certificationId");

    validateObjectId(id, "certificationId");

    const existing = await repo.findById(id);

    if (existing?.content?.certificatePublicId) {
      const resourceType = existing.content.certificateDownloadUrl?.includes(
        "/image/",
      )
        ? "image"
        : "raw";

      await cloudinaryService.delete(
        existing.content.certificatePublicId,
        resourceType,
      );
    }

    await deleteUC.execute(id);

    auditLogger.log({
      action: "CERTIFICATION_DELETE",
      userId: req.user.userId,
      resourceId: id,
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

export async function PUT(req) {
  return section(req);
}

export async function PATCH(req) {
  return update(req);
}

export async function GET(req) {
  return get(req);
}

export async function DELETE(req) {
  return remove(req);
}
