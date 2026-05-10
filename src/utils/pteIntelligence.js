export const SKILLS = ["Speaking", "Writing", "Reading", "Listening"];

export const TASK_LIBRARY = [
  { id: "read_aloud", name: "Read Aloud", skill: "Speaking", secondary: "Reading", weight: 86, difficulty: "Medium", tags: ["speaking", "reading", "fluency"] },
  { id: "repeat_sentence", name: "Repeat Sentence", skill: "Speaking", secondary: "Listening", weight: 96, difficulty: "Hard", tags: ["speaking", "listening", "memory"] },
  { id: "describe_image", name: "Describe Image", skill: "Speaking", secondary: null, weight: 72, difficulty: "Medium", tags: ["speaking", "template"] },
  { id: "write_essay", name: "Write Essay", skill: "Writing", secondary: null, weight: 88, difficulty: "Hard", tags: ["writing", "essay", "grammar"] },
  { id: "summarize_written", name: "Summarize Written Text", skill: "Writing", secondary: "Reading", weight: 82, difficulty: "Medium", tags: ["writing", "reading"] },
  { id: "rw_fitb", name: "R&W Fill in the Blanks", skill: "Reading", secondary: "Writing", weight: 94, difficulty: "Hard", tags: ["reading", "vocabulary"] },
  { id: "reorder", name: "Reorder Paragraph", skill: "Reading", secondary: null, weight: 78, difficulty: "Medium", tags: ["reading", "logic"] },
  { id: "write_dictation", name: "Write From Dictation", skill: "Listening", secondary: "Writing", weight: 98, difficulty: "Hard", tags: ["listening", "spelling"] },
  { id: "summarize_spoken", name: "Summarize Spoken Text", skill: "Listening", secondary: "Writing", weight: 76, difficulty: "Medium", tags: ["listening", "writing"] },
];

export const QUESTION_SEEDS = [
  { type: "Essay", task: "write_essay", prompt: "Some people think practical skills are more valuable than academic qualifications. Discuss both views and give your opinion.", difficulty: "Medium", tags: ["education", "argument"] },
  { type: "Read Aloud", task: "read_aloud", prompt: "Urban planners increasingly use public transport data to reduce congestion and improve access to employment hubs.", difficulty: "Easy", tags: ["speaking", "fluency"] },
  { type: "Repeat Sentence", task: "repeat_sentence", prompt: "The final report must include a clear summary of the research findings.", difficulty: "Medium", tags: ["listening", "memory"] },
  { type: "Describe Image", task: "describe_image", prompt: "A line chart comparing monthly renewable energy output across three regions.", difficulty: "Medium", tags: ["chart", "speaking"] },
  { type: "Reorder Paragraph", task: "reorder", prompt: "Arrange sentences about how peer review improves scientific reliability.", difficulty: "Hard", tags: ["reading", "cohesion"] },
  { type: "Fill in Blanks", task: "rw_fitb", prompt: "The rapid adoption of digital tools has [blank] the way students access academic resources.", difficulty: "Medium", tags: ["vocabulary", "grammar"] },
];

const clamp = (value, min = 0, max = 90) => Math.max(min, Math.min(max, Math.round(value)));
const avg = (values) => Math.round(values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1));

export function normalizeScores(scores = {}) {
  return {
    Speaking: Number(scores.Speaking ?? scores.S ?? 68),
    Writing: Number(scores.Writing ?? scores.W ?? 65),
    Reading: Number(scores.Reading ?? scores.R ?? 70),
    Listening: Number(scores.Listening ?? scores.L ?? 66),
  };
}

export function detectWeaknesses(scores = {}) {
  const normalized = normalizeScores(scores);
  return SKILLS
    .map((skill) => {
      const score = normalized[skill];
      const gap = Math.max(0, 90 - score);
      return {
        skill,
        score,
        gap,
        severity: score < 65 ? "critical" : score < 79 ? "high" : score < 85 ? "medium" : "low",
      };
    })
    .sort((a, b) => b.gap - a.gap);
}

export function rankTasks(scores = {}, history = []) {
  const weaknesses = detectWeaknesses(scores);
  const weaknessMap = Object.fromEntries(weaknesses.map((item) => [item.skill, item]));
  const attemptsByTask = history.reduce((map, item) => {
    map[item.taskId] = (map[item.taskId] || 0) + 1;
    return map;
  }, {});

  return TASK_LIBRARY.map((task) => {
    const primaryGap = weaknessMap[task.skill]?.gap || 0;
    const secondaryGap = task.secondary ? weaknessMap[task.secondary]?.gap || 0 : 0;
    const freshnessPenalty = Math.min(attemptsByTask[task.id] || 0, 8) * 2;
    const roi = clamp((task.weight * 0.55) + (primaryGap * 0.7) + (secondaryGap * 0.35) - freshnessPenalty, 0, 100);
    const priority = clamp((roi * 0.65) + (task.weight * 0.35), 0, 100);
    return {
      ...task,
      roi,
      priority,
      recommendation: recommendationFor(task, weaknessMap, roi),
    };
  }).sort((a, b) => b.priority - a.priority);
}

function recommendationFor(task, weaknessMap, roi) {
  const target = weaknessMap[task.skill];
  if (roi >= 85) return `Do this today: it directly improves ${task.skill}${task.secondary ? ` and ${task.secondary}` : ""}.`;
  if (target?.severity === "critical") return `Use short daily sets until ${task.skill} reaches 65+.`;
  if (task.secondary) return `Good dual-skill ROI for ${task.skill}/${task.secondary}.`;
  return `Useful support task after your critical tasks are complete.`;
}

export function predictScore(scores = {}, history = []) {
  const normalized = normalizeScores(scores);
  const current = avg(SKILLS.map((skill) => normalized[skill]));
  const recent = history.slice(-5);
  const activityLift = Math.min(recent.length * 1.4, 8);
  const weakPenalty = detectWeaknesses(normalized).filter((item) => item.score < 65).length * 2;
  return {
    current,
    sevenDay: clamp(current + activityLift - weakPenalty),
    thirtyDay: clamp(current + activityLift + 6 - weakPenalty),
    targetGap: Math.max(0, 90 - current),
  };
}

export function skillContribution(scores = {}) {
  const normalized = normalizeScores(scores);
  const totalGap = SKILLS.reduce((sum, skill) => sum + Math.max(0, 90 - normalized[skill]), 0) || 1;
  return SKILLS.map((skill) => {
    const gap = Math.max(0, 90 - normalized[skill]);
    return {
      skill,
      score: normalized[skill],
      contribution: Math.round((gap / totalGap) * 100),
    };
  });
}

export function scoreEssayLocally(text = "") {
  const clean = text.trim();
  const words = clean ? clean.split(/\s+/).filter(Boolean) : [];
  const sentences = clean ? clean.split(/[.!?]+/).map((item) => item.trim()).filter(Boolean) : [];
  const paragraphs = clean.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
  const uniqueRatio = words.length ? new Set(words.map((word) => word.toLowerCase().replace(/[^a-z]/g, ""))).size / words.length : 0;
  const connectors = ["however", "therefore", "furthermore", "moreover", "consequently", "although", "in conclusion"];
  const connectorCount = connectors.filter((word) => clean.toLowerCase().includes(word)).length;
  const longSentences = sentences.filter((sentence) => sentence.split(/\s+/).length > 32);
  const weakSentences = sentences.filter((sentence) => sentence.split(/\s+/).length < 8 || sentence.split(/\s+/).length > 36);

  const form = words.length >= 200 && words.length <= 300 ? 90 : words.length >= 180 && words.length <= 320 ? 74 : 54;
  const structure = clamp((paragraphs.length >= 4 ? 82 : paragraphs.length >= 3 ? 72 : 55) + connectorCount * 3);
  const vocabulary = clamp(58 + uniqueRatio * 38);
  const grammar = clamp(82 - longSentences.length * 4 - weakSentences.length * 2);
  const coherence = clamp((structure * 0.6) + (grammar * 0.4));
  const overall = clamp((form * 0.2) + (structure * 0.22) + (vocabulary * 0.22) + (grammar * 0.22) + (coherence * 0.14));

  return {
    overall,
    grammar,
    vocabulary,
    structure,
    coherence,
    form,
    wordCount: words.length,
    weakSentences,
    suggestions: [
      words.length < 200 ? "Increase the essay to at least 200 words." : words.length > 300 ? "Reduce the essay below 300 words." : "Keep the current length range.",
      connectorCount < 3 ? "Add more logical connectors between ideas." : "Connector usage is strong.",
      paragraphs.length < 4 ? "Use four clear paragraphs: introduction, two body paragraphs, conclusion." : "Paragraph structure is exam-ready.",
    ],
  };
}

export function compareTranscript(reference = "", spoken = "") {
  const refWords = reference.toLowerCase().match(/[a-z']+/g) || [];
  const spokenWords = spoken.toLowerCase().match(/[a-z']+/g) || [];
  const matched = refWords.filter((word, index) => word === spokenWords[index]).length;
  const content = refWords.length ? matched / refWords.length : 0;
  const lengthRatio = refWords.length ? Math.min(spokenWords.length / refWords.length, 1) : 0;
  return {
    accuracy: clamp(content * 90),
    fluency: clamp((lengthRatio * 72) + (content * 18)),
    pronunciation: clamp((content * 76) + 10),
    missedWords: refWords.filter((word, index) => word !== spokenWords[index]).slice(0, 12),
  };
}

export function buildStudyPlan(scores = {}, daysToExam = 30) {
  const ranked = rankTasks(scores).slice(0, 5);
  const minutes = daysToExam <= 14 ? 90 : daysToExam <= 30 ? 70 : 50;
  return ranked.map((task, index) => ({
    ...task,
    minutes: Math.max(10, Math.round((minutes - index * 8) / 5) * 5),
    target: index === 0 ? "Core drill" : index < 3 ? "Support drill" : "Maintenance",
  }));
}

export function invitationPrediction({ points = 65, occupation = "", state = "", rounds = [] }) {
  const latest = rounds[0] || {};
  const minPoints = Number(latest.minPoints || 75);
  const margin = Number(points) - minPoints;
  const occupationBoost = /software|nurse|chef|carpenter|plasterer/i.test(occupation) ? -4 : 0;
  const stateBoost = /SA|WA|TAS|NT/i.test(state) ? 5 : /NSW|VIC/i.test(state) ? -3 : 0;
  const probability = Math.max(5, Math.min(92, 45 + margin * 5 + stateBoost + occupationBoost));
  return {
    probability: Math.round(probability),
    competitiveness: probability >= 70 ? "Strong" : probability >= 45 ? "Moderate" : "Competitive",
    waitTime: probability >= 70 ? "1-3 rounds" : probability >= 45 ? "3-6 rounds" : "6+ rounds",
    minPoints,
    margin,
  };
}

export function awardGamification(history = []) {
  const xp = history.reduce((sum, item) => sum + (item.score || 60), 0);
  const streak = Math.min(history.length, 30);
  const badges = [
    history.length >= 1 && "First Practice",
    history.length >= 5 && "Five-Set Focus",
    streak >= 7 && "Seven-Day Streak",
    history.some((item) => item.score >= 79) && "79+ Breakthrough",
  ].filter(Boolean);
  return { xp, streak, level: Math.max(1, Math.floor(xp / 500) + 1), badges };
}
