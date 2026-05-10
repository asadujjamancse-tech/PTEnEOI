import generateReadAloudQuestions from "../utils/generateReadAloudQuestions";

// Pre-generate a starter bank of 120 questions. Consumers may add more at runtime.
const INITIAL_READALOUD = generateReadAloudQuestions(120);

export default INITIAL_READALOUD;
