import { Component, type ErrorInfo, type ReactNode } from "react";
import { reportError } from "@/lib/errors";

type Props = {
  children: ReactNode;
  fallback?: (props: { error: Error; reset: () => void }) => ReactNode;
};

type State = {
  error: Error | null;
};

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, `react-boundary${info.componentStack ? "" : ""}`);
    if (info.componentStack) {
      console.error(info.componentStack);
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (error) {
      if (this.props.fallback) {
        return this.props.fallback({ error, reset: this.reset });
      }
      return (
        <div className="flex min-h-[40vh] items-center justify-center px-4">
          <div className="max-w-md text-center">
            <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This section failed to render. You can try again or refresh the page.
            </p>
            <button
              type="button"
              onClick={this.reset}
              className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
