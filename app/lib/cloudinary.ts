import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a raw image buffer to Cloudinary.
 *
 * @param buffer   - Raw image bytes
 * @param mimeType - e.g. "image/jpeg", "image/png", "image/webp"
 * @param folder   - Cloudinary folder, default "laby/chat"
 * @returns Secure HTTPS URL of the uploaded image
 */
export async function uploadImageToCloudinary(
  buffer: Buffer,
  mimeType: string,
  folder = "laby/chat"
): Promise<string> {
  const dataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    quality: "auto",
    fetch_format: "auto",
  });

  return result.secure_url;
}
