import React from "react";

export const cardStyle = {
  background: "#0F1929",
  border: "1px solid #1E293B",
  borderRadius: 14,
  padding: 18,
};

export const compactCardStyle = {
  background: "#0A1222",
  border: "1px solid #1E293B",
  borderRadius: 12,
  padding: 14,
};

export const inputStyle = {
  background: "#0F1929",
  border: "1px solid #334155",
  borderRadius: 10,
  color: "#fff",
  padding: "10px 12px",
  width: "100%",
  outline: "none",
};

export const buttonStyle = {
  background: "#0EA5E9",
  border: "none",
  color: "#fff",
  fontWeight: 700,
  borderRadius: 10,
  cursor: "pointer",
  padding: "10px 14px",
};

export function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{title}</div>
      {subtitle && <div style={{ color: "#64748B", fontSize: 13, lineHeight: 1.6 }}>{subtitle}</div>}
    </div>
  );
}

export function MetricCard({ label, value, color = "#38BDF8", detail }) {
  return (
    <div style={{ ...compactCardStyle, borderColor: `${color}55` }}>
      <div style={{ color, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>{value}</div>
      {detail && <div style={{ color: "#64748B", fontSize: 11, marginTop: 4 }}>{detail}</div>}
    </div>
  );
}

export function ProgressBar({ value, color = "#38BDF8" }) {
  return (
    <div style={{ height: 6, background: "#1E293B", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.max(0, Math.min(100, value))}%`, background: color, borderRadius: 4 }} />
    </div>
  );
}

export function ResponsiveGrid({ children, min = 220, style = {} }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`, gap: 12, ...style }}>
      {children}
    </div>
  );
}
