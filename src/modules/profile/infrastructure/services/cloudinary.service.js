import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { fileTypeFromBuffer } from "file-type";
import { ValidationError } from "@/shared/errors";

class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    
    this.allowedFormats = [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "svg",
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "txt",
    ];

    this.allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",

      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",

      "text/plain",
    ];
    
    this.maxSize = 5 * 1024 * 1024;
  }

  async validateFile(file) {
    if (!file) throw new ValidationError("File is required");

    if (!file.buffer || !file.size) {
      throw new ValidationError("Invalid file object");
    }

    if (file.size > this.maxSize) {
      throw new ValidationError("File size exceeds limit");
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new ValidationError("Invalid MIME type");
    }

    const type = await fileTypeFromBuffer(file.buffer);

    const ext = type?.ext || this.getExtensionFromName(file.originalname);

    if (!ext || !this.allowedFormats.includes(ext)) {
      throw new ValidationError("Invalid file format");
    }

    if (ext === "svg") {
      const content = file.buffer.toString("utf-8");

      if (content.includes("<script") || content.includes("onload=")) {
        throw new ValidationError("Unsafe SVG content");
      }
    }

    return ext;
  }

  getExtensionFromName(filename = "") {
    return filename.split(".").pop()?.toLowerCase();
  }

  uploadBuffer(buffer, options) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) return reject(error);

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type,
          });
        },
      );

      streamifier.createReadStream(buffer).pipe(stream);
    });
  }

  async upload(file, folder = "profile") {
    const ext = await this.validateFile(file);

    const isImage = ["jpg", "jpeg", "png", "webp", "svg"].includes(ext);

    const resourceType = isImage ? "image" : "raw";

    return this.uploadBuffer(file.buffer, {
      folder,
      resource_type: resourceType,

      allowed_formats: this.allowedFormats,

      transformation: isImage
        ? [
            { quality: "auto", fetch_format: "auto" },
            { strip: true },
          ]
        : undefined,
    });
  }

  async delete(publicId, resourceType = "image") {
    if (!publicId) return;

    return cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  }

  async replace(oldPublicId, file, folder = "profile") {
    const uploaded = await this.upload(file, folder);

    if (oldPublicId) {
      await this.delete(oldPublicId, uploaded.resourceType);
    }

    return uploaded;
  }
}

export const cloudinaryService = new CloudinaryService();
