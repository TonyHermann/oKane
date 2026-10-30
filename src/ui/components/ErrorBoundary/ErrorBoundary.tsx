import {
  Component,
  type ErrorInfo,
  type FunctionComponent,
  type ReactNode,
} from "react";
import type { FallbackProps } from "./ErrorBoundaryTypes";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  Fallback: FunctionComponent<FallbackProps>;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error: ", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    const { children, Fallback } = this.props;
    const { hasError, error } = this.state;

    if (hasError && error) {
      return <Fallback error={error} resetError={this.resetError} />;
    }

    return children;
  }
}
