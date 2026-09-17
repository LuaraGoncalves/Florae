import { v2 as cloudinary } from "cloudinary";

export function imageStorageConfigured() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

export async function storeImage(buffer: Buffer): Promise<string> {
  cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder: "florae/plants", resource_type: "image", format: "webp", timeout: 45000 }, (error, result) => {
      if (error || !result?.secure_url) return reject(new Error("Image storage unavailable"));
      resolve(result.secure_url);
    }).end(buffer);
  });
}
