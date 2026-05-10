export function generateMockScore() {
  const rand = () => Math.floor(45 + Math.random() * 45);
  return { overall: rand(), grammar: Math.floor(1 + Math.random() * 5), cohesion: Math.floor(1 + Math.random() * 5) };
}

export default generateMockScore;
