export const MAX_PRODUCT_IMAGES = 5;
export const MAX_PRODUCT_IMAGE_BYTES = 2 * 1024 * 1024;

export type ProductImageFormValue = {
  url: string;
  position: number;
};

export function productImagesForApi(images: ProductImageFormValue[]) {
  return images
    .filter((image) => image.url.trim())
    .map((image, index) => ({
      url: image.url.trim(),
      position: index,
    }));
}

export function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read image file"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read image file"));
    reader.readAsDataURL(file);
  });
}

export function validateProductImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Choose a JPEG, PNG, or WebP image.";
  if (file.size > MAX_PRODUCT_IMAGE_BYTES) return "Image must be 2 MB or smaller.";
  return null;
}

export function validateProductImageUrl(url: string): string | null {
  const value = url.trim();
  if (!value) return "Enter an image URL.";
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:" && !value.startsWith("data:image/")) {
      return "Use an http(s) link or upload a file from your device.";
    }
    return null;
  } catch {
    return "Enter a valid image URL.";
  }
}
