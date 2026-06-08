import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errors";

type QueryErrorStateProps = {
  error?: unknown;
  title?: string;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
};

export function QueryErrorState({
  error,
  title = "Couldn't load data",
  onRetry,
  retrying = false,
  className,
}: QueryErrorStateProps) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <p>{getErrorMessage(error)}</p>
        {onRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit border-destructive/40 bg-background text-destructive hover:bg-destructive/10"
            disabled={retrying}
            onClick={onRetry}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${retrying ? "animate-spin" : ""}`} />
            {retrying ? "Retrying…" : "Try again"}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
