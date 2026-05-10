import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("App error boundary caught an error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", background: "#070D1A", color: "#fff", padding: 24, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", background: "#0A1222", border: "1px solid #7F1D1D", borderRadius: 14, padding: 20 }}>
            <div style={{ color: "#FCA5A5", fontWeight: 800, marginBottom: 8 }}>Something went wrong</div>
            <div style={{ color: "#94A3B8", fontSize: 13 }}>Refresh the page. Your local practice history and scores are stored in the browser.</div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
