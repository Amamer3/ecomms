import logoSrc from "@/assets/gomarket-Photoroom.png";
import { APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  sm: "h-7",
  md: "h-8",
  lg: "h-9",
  xl: "h-10",
  "2xl": "h-11",
} as const;

type BrandLogoProps = {
  className?: string;
  size?: keyof typeof SIZE_CLASS;
};

export function BrandLogo({ className, size = "md" }: BrandLogoProps) {
  return (
    <img
      src={logoSrc}
      alt={APP_NAME}
      width={200}
      height={52}
      className={cn("w-auto max-w-[min(100%,200px)] object-contain object-left", SIZE_CLASS[size], className)}
    />
  );
}
