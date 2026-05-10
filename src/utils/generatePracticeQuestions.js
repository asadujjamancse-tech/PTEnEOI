// Generic practice question generator used for reading/writing/listening banks.
const topics = [
  "education policy and workforce planning",
  "renewable energy adoption and economic impacts",
  "urban transport and congestion management",
  "public health interventions and preventative care",
  "artificial intelligence in everyday life",
  "climate adaptation strategies for coastal cities",
  "global trade and supply chain resilience",
  "cultural heritage and tourism development",
  "higher education reform and online learning",
  "small business financing and local economies"
];

export function generatePracticeQuestions(zone = 'generic', count = 100) {
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const tagsPool = ['academic','everyday','policy','technology','health','environment','economics','culture','education','media'];
  return Array.from({ length: count }).map((_, i) => {
    const id = `${zone.slice(0,2)}-${String(i+1).padStart(3,'0')}`;
    const topic = topics[i % topics.length];
    const title = `${zone[0].toUpperCase() + zone.slice(1)} Practice ${i+1}`;
    const base = `Discuss recent developments in ${topic}. Focus on causes, effects, and potential solutions.`;
    const text = zone === 'listening' ? `${base} Speak clearly and listen carefully.` : zone === 'writing' ? `${base} Write a structured response.` : `${base} Read aloud at conversational pace.`;
    const difficulty = difficulties[i % difficulties.length];
    const appearedCount = Math.floor(Math.random() * 20);
    const prediction = Math.random() < 0.3 ? 'Likely High' : Math.random() < 0.5 ? 'Likely Medium' : 'Likely Low';
    const tags = [tagsPool[i % tagsPool.length], tagsPool[(i+2) % tagsPool.length]];
    const source = ['News','ExamPrep','Article','Lecture'][i % 4];
    return { id, title, text, difficulty, appearedCount, prediction, tags, source };
  });
}

export default generatePracticeQuestions;
