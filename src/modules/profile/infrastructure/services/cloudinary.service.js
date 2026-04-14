import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    this.allowedFormats = ["jpg", "jpeg", "png", "webp"];
    this.maxSize = 2 * 1024 * 1024;
  }

  validateFile(file) {
    if (!file) {
      throw new Error("File is required");
    }

    if (file.size > this.maxSize) {
      throw new Error("File size exceeds limit");
    }

    const format = file.mimetype.split("/")[1];
    if (!this.allowedFormats.includes(format)) {
      throw new Error("Invalid file format");
    }
  }

  uploadBuffer(buffer, folder = "profile") {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          allowed_formats: this.allowedFormats,
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) return reject(error);

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      streamifier.createReadStream(buffer).pipe(stream);
    });
  }

  async upload(file, folder = "profile") {
    this.validateFile(file);
    return this.uploadBuffer(file.buffer, folder);
  }

  async delete(publicId) {
    if (!publicId) return;

    return cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
  }

  async replace(oldPublicId, file, folder = "profile") {
    const uploaded = await this.upload(file, folder);

    if (oldPublicId) {
      await this.delete(oldPublicId);
    }

    return uploaded;
  }
}

export const cloudinaryService = new CloudinaryService();
