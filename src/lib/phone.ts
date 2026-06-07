/** Ghana default; API expects E.164 e.g. +233200000001 */

const E164_RE = /^\+[1-9]\d{7,14}$/;

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
