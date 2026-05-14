import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, info.componentStack);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            height: "var(--app-height, 100dvh)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            padding: "24px",
            background: "var(--bg-base)",
            color: "var(--text-main)",
            textAlign: "center",
          }}
        >
          <svg width="48" height="48" viewBox="0 0 28 22" fill="none">
            <path
              d="M2 19 L8 6 L14 14 L20 6 L26 19"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h1
              style={{
                fontSize: "18px",
                fontWeight: 700,
                margin: 0,
                color: "var(--text-main)",
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-muted)",
                margin: 0,
                maxWidth: "280px",
              }}
            >
              {this.state.error?.message ?? "An unexpected error occurred."}
            </p>
          </div>

          <button
            onClick={this.reset}
            style={{
              marginTop: "8px",
              padding: "14px 32px",
              borderRadius: "16px",
              border: "none",
              background: "var(--primary)",
              color: "white",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
