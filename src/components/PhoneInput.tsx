import {
  coerceGhanaPhoneInput,
  E164_PHONE_PLACEHOLDER,
} from "@/lib/phone";
import { cn } from "@/lib/utils";

type PhoneInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange" | "inputMode"
> & {
  value: string;
  onChange: (value: string) => void;
};

export function PhoneInput({
  value,
  onChange,
  className,
  placeholder = E164_PHONE_PLACEHOLDER,
  autoComplete = "tel",
  ...props
}: PhoneInputProps) {
  return (
    <input
      {...props}
      type="tel"
      inputMode="tel"
      autoComplete={autoComplete}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(coerceGhanaPhoneInput(e.target.value))}
      className={cn(className)}
    />
  );
}
