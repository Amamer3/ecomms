import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authFieldClass, authPillFieldClass } from "@/components/auth/AuthShell";
import { cn } from "@/lib/utils";

export function PasswordField({
  id = "password",
  label = "Password",
  value,
  onChange,
  autoComplete = "current-password",
  className,
  variant = "default",
  inputClassName,
  labelClassName,
}: {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  className?: string;
  variant?: "default" | "pill";
  inputClassName?: string;
  labelClassName?: string;
}) {
  const fieldClass = inputClassName ?? (variant === "pill" ? authPillFieldClass : authFieldClass);
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className={labelClassName}>
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className={cn(fieldClass, "pr-11")}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
