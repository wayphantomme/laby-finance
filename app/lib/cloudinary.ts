import { v2 as cloudinary } from "cloudinary";

// Configure once — reads CLOUDINARY_URL automatically if set,
// but we also set explicitly for clarity.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_URL
    ? undefined // parsed from CLOUDINARY_URL
    : undefined,
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
    // Auto-quality + format for smaller file size without visible loss
    quality: "auto",
    fetch_format: "auto",
  });

  return result.secure_url;
}
