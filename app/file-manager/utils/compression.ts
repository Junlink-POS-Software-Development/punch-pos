import imageCompression from "browser-image-compression";

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  savingsPercentage: number;
  previewUrl: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Aggressively compresses an image file to modern WebP format
 * to maximize storage savings.
 */
export async function compressImageToWebP(
  file: File,
  onProgress?: (progress: number) => void
): Promise<CompressionResult> {
  const originalSize = file.size;

  // If already SVG or GIF (animated), don't compress via lossy webp
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      savingsPercentage: 0,
      previewUrl: URL.createObjectURL(file),
    };
  }

  const options = {
    maxSizeMB: 0.25, // 250 KB maximum target
    maxWidthOrHeight: 1600, // HD max dimension
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.75,
    onProgress: (p: number) => {
      if (onProgress) onProgress(Math.round(p));
    },
  };

  let compressedBlob: Blob;

  try {
    const compressFn =
      typeof imageCompression === "function"
        ? imageCompression
        : (imageCompression as any).default;

    compressedBlob = await compressFn(file, options);
  } catch (workerErr) {
    console.warn("Web worker compression failed, falling back to main thread:", workerErr);
    try {
      const compressFn =
        typeof imageCompression === "function"
          ? imageCompression
          : (imageCompression as any).default;
      compressedBlob = await compressFn(file, { ...options, useWebWorker: false });
    } catch (fallbackErr) {
      console.warn("Library compression failed, using canvas fallback:", fallbackErr);
      compressedBlob = await canvasCompressFallback(file, 1600, 0.75);
    }
  }

  // Ensure file name has .webp extension
  const nameParts = file.name.split(".");
  const baseName = nameParts.length > 1 ? nameParts.slice(0, -1).join(".") : file.name;
  const webpFileName = `${baseName}.webp`;

  const compressedFile = new File([compressedBlob], webpFileName, {
    type: "image/webp",
    lastModified: Date.now(),
  });

  const compressedSize = compressedFile.size;
  const savings = Math.max(
    0,
    Math.round(((originalSize - compressedSize) / originalSize) * 100)
  );

  return {
    file: compressedFile,
    originalSize,
    compressedSize,
    savingsPercentage: savings,
    previewUrl: URL.createObjectURL(compressedFile),
  };
}

/**
 * Fallback canvas compressor if library worker encounters issues.
 */
function canvasCompressFallback(
  file: File,
  maxDimension = 1600,
  quality = 0.75
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Failed to get 2d context"));
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Canvas toBlob failed"));
          },
          "image/webp",
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
