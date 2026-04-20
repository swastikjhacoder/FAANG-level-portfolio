import connectDB from "@/shared/lib/db";

import withRateLimit from "@/shared/security/middleware/rateLimit.middleware";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";

import { sanitizeInput } from "@/shared/security/sanitizers/input.sanitizer";

import { AddContactUseCase } from "@/modules/profile/application/useCases/addContact.usecase";
import { UpdateContactUseCase } from "@/modules/profile/application/useCases/updateContact.usecase";
import { DeleteContactUseCase } from "@/modules/profile/application/useCases/deleteContact.usecase";

import { ContactRepository } from "@/modules/profile/infrastructure/persistence/contact.repository";

import { authGuard } from "@/modules/auth/security/guards/auth.guard";
import { roleGuard } from "@/modules/auth/security/guards/role.guard";

import { ROLES } from "@/shared/constants/roles";

import { validateObjectId } from "@/shared/utils/validateObjectId";
import { ValidationError } from "@/shared/errors";
import auditLogger from "@/shared/security/audit/audit.logger";
import { cloudinaryService } from "@/modules/profile/infrastructure/services/cloudinary.service";

const repo = new ContactRepository();

const createUC = new AddContactUseCase(repo);
const updateUC = new UpdateContactUseCase(repo);
const deleteUC = new DeleteContactUseCase(repo);

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
  if (!file) return null;

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

    if (data.socials) {
      data.socials = JSON.parse(data.socials);
    }

    if (Array.isArray(data.socials)) {
      for (let i = 0; i < data.socials.length; i++) {
        const file = files[`socialIcon_${i}`];

        if (file) {
          const adapted = await toUploadFile(file);

          const uploaded = await cloudinaryService.upload(
            adapted,
            "contact/socials",
          );

          data.socials[i].icon = {
            url: uploaded.url,
            publicId: uploaded.publicId,
          };
        } else {
          data.socials[i].icon = null;
        }
      }
    }

    const sanitized = sanitizeInput(data);

    const result = await createUC.execute(sanitized, req.user);

    auditLogger.log({
      action: "CONTACT_CREATE",
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

    const data = await repo.findByProfile(profileId);

    return ok(data);
  } catch (err) {
    return fail(err);
  }
};

const updateHandler = async (req) => {
  try {
    console.log("🚀 PATCH START");

    await connectDB();
    console.log("✅ DB connected");

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("contactId");
    console.log("📌 contactId:", id);

    validateObjectId(id, "contactId");

    const existing = await repo.findById(id);
    console.log("📦 existing:", JSON.stringify(existing, null, 2));

    if (!existing) {
      throw new ValidationError("Contact not found");
    }

    const formData = await safeFormData(req);

    console.log("📥 RAW FORM DATA:");
    for (const [k, v] of formData.entries()) {
      console.log("   ", k, v instanceof File ? `File(${v.name})` : v);
    }

    const { data, files } = parseFormData(formData);

    console.log("📄 PARSED DATA:", data);
    console.log("📁 FILES:", Object.keys(files));

    if (data.socials) {
      try {
        data.socials = JSON.parse(data.socials);
      } catch (e) {
        console.error("❌ JSON PARSE ERROR:", e);
        throw new ValidationError("Invalid socials JSON");
      }
    }

    console.log("🧩 SOCIALS:", data.socials);

    if (Array.isArray(data.socials)) {
      for (let i = 0; i < data.socials.length; i++) {
        console.log(`➡️ Processing socials[${i}]`);

        const file = files[`socialIcon_${i}`];
        console.log(`   file:`, file ? file.name : "❌ NO FILE");

        if (file) {
          console.log("   🔄 Uploading new file...");

          const adapted = await toUploadFile(file);
          console.log("   ✅ adapted");

          const oldPublicId = existing?.socials?.[i]?.icon?.publicId;

          console.log("   🗑 oldPublicId:", oldPublicId);

          const uploaded = await cloudinaryService.replace(
            oldPublicId,
            adapted,
            "contact/socials",
          );

          console.log("   ☁️ uploaded:", uploaded);

          data.socials[i].icon = {
            url: uploaded.url,
            publicId: uploaded.publicId,
          };
        } else {
          console.log("   ♻️ Keeping old icon");

          data.socials[i].icon = existing?.socials?.[i]?.icon || null;
        }
      }
    }

    console.log("🧼 Before sanitize:", data);

    const sanitized = sanitizeInput(data);

    console.log("🧼 After sanitize:", sanitized);

    const result = await updateUC.execute(id, sanitized, req.user);

    console.log("✅ UPDATE RESULT:", result);

    auditLogger.log({
      action: "CONTACT_UPDATE",
      userId: req.user.userId,
      resourceId: id,
    });

    return ok(result);
  } catch (err) {
    console.error("🔥 ERROR:", err);
    return fail(err);
  }
};

const deleteHandler = async (req) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("contactId");

    validateObjectId(id, "contactId");

    const existing = await repo.findById(id);

    if (existing?.socials?.length) {
      for (const social of existing.socials) {
        if (social?.icon?.publicId) {
          await cloudinaryService.delete(social.icon.publicId, "image");
        }
      }
    }

    await deleteUC.execute(id);

    auditLogger.log({
      action: "CONTACT_DELETE",
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
  DEV ? { limit: 1000, window: 60 } : { limit: 10, window: 60 },
);

const update = withRateLimit(
  withCsrf(authGuard(roleGuard(updateHandler, ADMIN))),
  DEV ? { limit: 1000, window: 60 } : { limit: 10, window: 60 },
);

const remove = withRateLimit(
  withCsrf(authGuard(roleGuard(deleteHandler, ADMIN))),
  DEV ? { limit: 1000, window: 60 } : { limit: 5, window: 60 },
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
