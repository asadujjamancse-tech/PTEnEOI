// generateReadAloudQuestions.js
// Lightweight generator for mock Read Aloud questions.
export function generateReadAloudQuestions(count = 120) {
  const difficulties = ["Easy", "Medium", "Hard"];
  const tagsPool = ["academic", "everyday", "science", "economics", "policy", "environment", "technology", "health", "education", "culture"];
  const sources = ["News", "Academic", "Wikipedia", "Magazine", "ExamPrep"].map(s => s);

  const lorem = [
    "Recent studies indicate that early childhood education has a long-lasting effect on cognitive and social development.",
    "Urban planners face a challenge balancing infrastructure with the demands of a growing population.",
    "Advances in renewable energy technologies have dramatically reduced costs over the last decade.",
    "Healthcare systems are increasingly adopting data analytics to improve patient outcomes.",
    "Globalisation has reshaped labour markets and created both opportunities and challenges for workers.",
    "The committee recommended a phased approach to reduce emissions across multiple sectors.",
    "Technological innovation often outpaces the regulatory frameworks that seek to manage it.",
    "Cultural festivals play a vital role in maintaining community identity and heritage.",
    "Higher education institutions are experimenting with hybrid learning models post-pandemic.",
    "Small businesses rely on local networks to survive economic downturns."
  ];

  return Array.from({ length: count }).map((_, i) => {
    const id = `ra-${String(i + 1).padStart(3, "0")}`;
    const base = lorem[i % lorem.length];
    const title = `Read Aloud Practice ${i + 1}`;
    const text = `${base} ${base.split('.').slice(0,2).join('.')} This passage is suitable for a 30–50 second read.`;
    const difficulty = difficulties[i % difficulties.length];
    const appearedCount = Math.floor(Math.random() * 15);
    const prediction = Math.random() < 0.2 ? "Likely High" : Math.random() < 0.5 ? "Likely Medium" : "Likely Low";
    const tags = [tagsPool[i % tagsPool.length], tagsPool[(i + 3) % tagsPool.length]];
    const source = sources[i % sources.length];
    return { id, title, text, difficulty, appearedCount, prediction, tags, source };
  });
}

export default generateReadAloudQuestions;
