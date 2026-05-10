export function generateMockScore() {
  const rand = () => Math.floor(40 + Math.random() * 50);
  return { overall: rand(), accuracy: Math.floor(1 + Math.random() * 5) };
}

export default generateMockScore;
