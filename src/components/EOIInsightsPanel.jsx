import React, { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { invitationPrediction } from "../utils/pteIntelligence";
import { cardStyle, MetricCard, ResponsiveGrid } from "./FeatureShell";

export default function EOIInsightsPanel({ points = 65, occupation = "", state = "", rounds = [] }) {
  const prediction = useMemo(() => invitationPrediction({ points, occupation, state, rounds }), [points, occupation, state, rounds]);
  const chartRows = (rounds.length ? rounds.slice(0, 8) : [
    { date: "Round 1", minPoints: 65, invitations: 500 },
    { date: "Round 2", minPoints: 75, invitations: 300 },
    { date: "Round 3", minPoints: 85, invitations: 180 },
  ]).map((row) => ({
    date: row.date,
    points: row.minPoints,
    invitations: row.invitations,
  })).reverse();

  return (
    <div style={{ ...cardStyle, marginBottom: 12 }}>
      <div style={{ color: "#38BDF8", fontSize: 12, fontWeight: 800, textTransform: "uppercase" }}>EOI Prediction Engine</div>
      <div style={{ color: "#64748B", fontSize: 12, marginTop: 4, marginBottom: 14 }}>Uses public invitation-round rows when available, plus local competitiveness rules for probability, wait time, and point comparison.</div>
      <ResponsiveGrid min={160} style={{ marginBottom: 14 }}>
        <MetricCard label="Invitation probability" value={`${prediction.probability}%`} color="#38BDF8" />
        <MetricCard label="Competitiveness" value={prediction.competitiveness} color="#A78BFA" />
        <MetricCard label="Estimated wait" value={prediction.waitTime} color="#FBBF24" />
        <MetricCard label="Point margin" value={prediction.margin >= 0 ? `+${prediction.margin}` : prediction.margin} color={prediction.margin >= 0 ? "#34D399" : "#F87171"} />
      </ResponsiveGrid>
      <div style={{ height: 210 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartRows}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="date" tick={{ fill: "#64748B", fontSize: 10 }} />
            <YAxis tick={{ fill: "#64748B", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#0F1929", border: "1px solid #334155", color: "#fff" }} />
            <Bar dataKey="points" fill="#38BDF8" name="Min points" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
