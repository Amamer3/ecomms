import { useRef, useState } from "react";
import { ImagePlus, Link2, Upload, X } from "lucide-react";
import {
  MAX_PRODUCT_IMAGES,
  readImageFile,
  validateProductImageFile,
  validateProductImageUrl,
  type ProductImageFormValue,
} from "@/lib/product-images";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ProductImageField({
  images,
  onChange,
  inputClassName,
  labelClassName = "mb-1.5 block text-sm font-medium",
  disabled,
}: {
  images: ProductImageFormValue[];
  onChange: (images: ProductImageFormValue[]) => void;
  inputClassName: string;
  labelClassName?: string;
  disabled?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [dragging, setDragging] = useState(false);
  const [readingFile, setReadingFile] = useState(false);

  const canAddMore = images.length < MAX_PRODUCT_IMAGES;

  const addImage = (url: string) => {
    onChange([...images, { url, position: images.length }]);
  };

  const removeImage = (index: number) => {
    onChange(
      images
        .filter((_, i) => i !== index)
        .map((image, position) => ({ ...image, position })),
    );
  };

  const addFiles = async (files: FileList | File[]) => {
    if (disabled || !canAddMore) return;
    const list = Array.from(files);
    if (list.length === 0) return;

    const remaining = MAX_PRODUCT_IMAGES - images.length;
    const batch = list.slice(0, remaining);
    if (list.length > remaining) {
      toast.message(`Only ${MAX_PRODUCT_IMAGES} images are allowed per product.`);
    }

    setReadingFile(true);
    try {
      const next = [...images];
      for (const file of batch) {
        const error = validateProductImageFile(file);
        if (error) {
          toast.error(error);
          continue;
        }
        const dataUrl = await readImageFile(file);
        next.push({ url: dataUrl, position: next.length });
      }
      onChange(next);
    } finally {
      setReadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onAddUrl = () => {
    const error = validateProductImageUrl(urlInput);
    if (error) {
      toast.error(error);
      return;
    }
    if (!canAddMore) {
      toast.error(`You can add up to ${MAX_PRODUCT_IMAGES} images.`);
      return;
    }
    addImage(urlInput.trim());
    setUrlInput("");
  };

  return (
    <div className="space-y-3">
      <div>
        <span className={labelClassName}>Product images</span>
        <p className="text-xs text-muted-foreground">
          Upload from your device or paste a hosted image URL. Up to {MAX_PRODUCT_IMAGES} images, 2 MB
          each.
        </p>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {images.map((image, index) => (
            <div
              key={`${image.url.slice(0, 32)}-${index}`}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border/60 bg-muted/20"
            >
              <img src={image.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeImage(index)}
                className="absolute right-1.5 top-1.5 rounded-full bg-background/90 p-1 text-muted-foreground shadow-sm transition-colors hover:text-destructive disabled:opacity-60"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {canAddMore ? (
            <button
              type="button"
              disabled={disabled || readingFile}
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border/80 bg-muted/10 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/[0.04] hover:text-foreground disabled:opacity-60"
            >
              <ImagePlus className="h-5 w-5" />
              Add
            </button>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || readingFile}
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragging(false);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void addFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-8 text-center transition-colors disabled:opacity-60",
            dragging
              ? "border-primary bg-primary/[0.06]"
              : "border-border/80 bg-muted/10 hover:border-primary/40 hover:bg-primary/[0.04]",
          )}
        >
          <div className="grid h-11 w-11 place-items-center rounded-full bg-background shadow-sm">
            <Upload className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {readingFile ? "Reading image…" : "Upload product image"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Drag and drop or click to browse</p>
          </div>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        disabled={disabled || !canAddMore}
        onChange={(e) => void addFiles(e.target.files ?? [])}
      />

      {canAddMore ? (
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className={cn(inputClassName, "pl-9")}
              value={urlInput}
              disabled={disabled}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/product.jpg"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAddUrl();
                }
              }}
            />
          </div>
          <button
            type="button"
            disabled={disabled || !urlInput.trim()}
            onClick={onAddUrl}
            className="shrink-0 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/40 disabled:opacity-60"
          >
            Add URL
          </button>
        </div>
      ) : null}
    </div>
  );
}
