import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

export async function runAction(
  label: string,
  fn: () => Promise<unknown>,
  onSuccess?: () => void,
): Promise<boolean> {
  try {
    await fn();
    toast.success(label);
    onSuccess?.();
    return true;
  } catch (error) {
    toast.error(getErrorMessage(error, "Action failed"));
    return false;
  }
}
