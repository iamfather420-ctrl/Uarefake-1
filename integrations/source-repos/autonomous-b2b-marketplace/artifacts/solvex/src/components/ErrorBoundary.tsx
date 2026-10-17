import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          backgroundColor: "#05080F",
          color: "#E2E8F0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontFamily: "'IBM Plex Mono', monospace"
        }}>
          <div style={{
            maxWidth: "600px",
            width: "100%",
            backgroundColor: "#07091A",
            border: "2px solid #D4AF37",
            borderRadius: "12px",
            padding: "2.5rem",
            boxShadow: "0 0 30px rgba(212, 175, 55, 0.2)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "2rem", color: "#D4AF37", marginBottom: "1rem" }}>
              ⚠️ SYSTEM EXCEPTION RECOVERED
            </div>
            <p style={{ color: "#94A3B8", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
              An unexpected runtime error occurred. The system has safely isolated the exception.
            </p>
            {this.state.error && (
              <pre style={{
                backgroundColor: "#0F172A",
                padding: "1rem",
                borderRadius: "6px",
                overflowX: "auto",
                fontSize: "0.8rem",
                color: "#F87171",
                textAlign: "left",
                marginBottom: "1.5rem",
                border: "1px solid #1E293B"
              }}>
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = "/";
                }}
                style={{
                  backgroundColor: "#D4AF37",
                  color: "#05080F",
                  border: "none",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "6px",
                  fontWeight: 800,
                  cursor: "pointer",
                  letterSpacing: "0.1em"
                }}
              >
                RETURN HOME
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: "transparent",
                  color: "#D4AF37",
                  border: "1px solid #D4AF37",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "6px",
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: "0.1em"
                }}
              >
                RELOAD SYSTEM
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
