import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { QueryErrorState } from "@/components/QueryErrorState";

type AsyncStateProps = {
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  isRetrying?: boolean;
  loadingMessage?: string;
  errorTitle?: string;
  children: ReactNode;
  className?: string;
};

export function AsyncState({
  isLoading = false,
  isError = false,
  error,
  onRetry,
  isRetrying = false,
  loadingMessage = "Loading…",
  errorTitle,
  children,
  className,
}: AsyncStateProps) {
  if (isLoading) {
    return (
      <div
        className={`flex items-center gap-2 text-sm text-muted-foreground ${className ?? ""}`}
        aria-busy="true"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        {loadingMessage}
      </div>
    );
  }

  if (isError) {
    return (
      <QueryErrorState
        error={error}
        title={errorTitle}
        onRetry={onRetry}
        retrying={isRetrying}
        className={className}
      />
    );
  }

  return <>{children}</>;
}
