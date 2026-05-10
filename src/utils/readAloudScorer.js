// Simple mock scoring engine returning placeholder scores between 1-5.
export function generateMockScore() {
  const rand = () => Math.floor(2 + Math.random() * 4); // 2-5
  return {
    fluency: rand(),
    pronunciation: rand(),
    oral_fluency: rand(),
    content: rand(),
    overall: Math.floor(55 + Math.random() * 35),
  };
}

export default generateMockScore;
