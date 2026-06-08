/** Ghana default; API expects E.164 e.g. +233200000001 */

export const GHANA_PHONE_PREFIX = "+233";
export const E164_PHONE_PLACEHOLDER = "+233200000001";

const GHANA_COUNTRY_CODE = "233";
const E164_RE = /^\+[1-9]\d{7,14}$/;

/** Default value for phone inputs — keeps +233 visible while the user types. */
export function defaultGhanaPhoneInput(): string {
  return GHANA_PHONE_PREFIX;
}

/**
 * Coerce live input so the Ghana country code stays present.
 * Accepts local numbers (020…), digits-only, or full E.164 while typing.
 */
export function coerceGhanaPhoneInput(raw: string): string {
  const prefix = GHANA_PHONE_PREFIX;

  if (!raw.trim()) return prefix;

  const cleaned = raw.replace(/[\s\-().]/g, "");

  if (!cleaned.startsWith("+")) {
    const digits = cleaned.replace(/\D/g, "");
    if (!digits) return prefix;
    if (digits.startsWith("0")) return prefix + digits.slice(1);
    if (digits.startsWith(GHANA_COUNTRY_CODE)) return "+" + digits;
    return prefix + digits;
  }

  const digits = cleaned.slice(1).replace(/\D/g, "");
  if (!digits) return prefix;

  if (digits.startsWith(GHANA_COUNTRY_CODE)) return "+" + digits;

  if (GHANA_COUNTRY_CODE.startsWith(digits)) return "+" + digits;

  if (digits.startsWith("0")) return prefix + digits.slice(1);

  return prefix + digits;
}

/** Seed a phone field from an existing E.164 value or fall back to +233. */
export function ghanaPhoneInputFrom(existing?: string | null): string {
  if (!existing?.trim()) return defaultGhanaPhoneInput();
  const normalized = normalizeE164Phone(existing);
  return normalized ?? coerceGhanaPhoneInput(existing);
}

/**
 * Normalize user input to E.164. Returns null if the result is not valid.
 */
export function normalizeE164Phone(input: string, defaultCountryCode = "233"): string | null {
  let digits = input.trim().replace(/[\s\-().]/g, "");

  if (digits.startsWith("+")) {
    digits = "+" + digits.slice(1).replace(/\D/g, "");
  } else {
    digits = digits.replace(/\D/g, "");
    if (!digits) return null;
    if (digits.startsWith("0")) digits = defaultCountryCode + digits.slice(1);
    else if (!digits.startsWith(defaultCountryCode)) digits = defaultCountryCode + digits;
    digits = "+" + digits;
  }

  if (!E164_RE.test(digits)) return null;
  return digits;
}

export function isValidE164Phone(input: string): boolean {
  return normalizeE164Phone(input) !== null;
}

export const E164_PHONE_HINT = "Use international format: +233200000001 (no spaces)";
