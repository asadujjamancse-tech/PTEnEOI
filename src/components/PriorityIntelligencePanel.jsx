import React from "react";
import { detectWeaknesses, predictScore, rankTasks, skillContribution } from "../utils/pteIntelligence";
import { MetricCard, ProgressBar, ResponsiveGrid, cardStyle } from "./FeatureShell";

const demoScores = { S: 72, W: 69, R: 74, L: 70 };

export default function PriorityIntelligencePanel({ latestScores = demoScores, practiceHistory = [] }) {
  const ranked = rankTasks(latestScores, practiceHistory).slice(0, 5);
  const prediction = predictScore(latestScores, practiceHistory);
  const weaknesses = detectWeaknesses(latestScores).slice(0, 3);
  const contribution = skillContribution(latestScores);

  return (
    <div style={{ ...cardStyle, marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 14 }}>
        <div>
          <div style={{ color: "#38BDF8", fontSize: 12, fontWeight: 800, textTransform: "uppercase" }}>ApeUni-style local intelligence</div>
          <div style={{ fontSize: 17, fontWeight: 800, marginTop: 4 }}>Smart Priority Map</div>
          <div style={{ color: "#64748B", fontSize: 12, marginTop: 4 }}>Mock AI logic ranks tasks by ROI, weak skills, dual-skill impact, and recent practice.</div>
        </div>
        <div style={{ color: "#94A3B8", fontSize: 12 }}>Prediction: <strong style={{ color: "#34D399" }}>{prediction.thirtyDay}</strong> in 30 days</div>
      </div>

      <ResponsiveGrid min={160} style={{ marginBottom: 14 }}>
        <MetricCard label="Current" value={prediction.current} color="#38BDF8" detail={`${prediction.targetGap} pts to 90`} />
        <MetricCard label="7-day forecast" value={prediction.sevenDay} color="#A78BFA" detail="Based on local history" />
        <MetricCard label="Top weakness" value={weaknesses[0]?.skill || "-"} color="#FBBF24" detail={`${weaknesses[0]?.gap || 0} point gap`} />
      </ResponsiveGrid>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr .85fr", gap: 14 }}>
        <div style={{ display: "grid", gap: 10 }}>
          {ranked.map((task, index) => (
            <div key={task.id} style={{ background: "#0A1222", border: "1px solid #1E293B", borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ color: "#E2E8F0", fontWeight: 800, fontSize: 13 }}>{index + 1}. {task.name}</div>
                  <div style={{ color: "#64748B", fontSize: 11, marginTop: 3 }}>{task.recommendation}</div>
                </div>
                <div style={{ color: task.roi >= 85 ? "#34D399" : "#FBBF24", fontWeight: 800, fontSize: 18 }}>{task.roi}</div>
              </div>
              <div style={{ marginTop: 9 }}><ProgressBar value={task.roi} color={task.roi >= 85 ? "#34D399" : "#FBBF24"} /></div>
            </div>
          ))}
        </div>

        <div style={{ background: "#0A1222", border: "1px solid #1E293B", borderRadius: 12, padding: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>Skill Contribution To Gap</div>
          {contribution.map((item) => (
            <div key={item.skill} style={{ marginBottom: 11 }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#94A3B8", fontSize: 12, marginBottom: 4 }}>
                <span>{item.skill}</span><span>{item.contribution}%</span>
              </div>
              <ProgressBar value={item.contribution} color={item.skill === "Speaking" ? "#38BDF8" : item.skill === "Writing" ? "#A78BFA" : item.skill === "Reading" ? "#34D399" : "#FBBF24"} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
