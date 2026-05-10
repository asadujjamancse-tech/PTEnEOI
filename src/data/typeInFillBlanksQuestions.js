// Each question: audio text (for TTS), passage with {BLANK} markers, and answers
const TYPE_IN_FILL_BLANKS = [
  {
    id: "tifb-001", difficulty: "Easy", title: "Study Skills",
    audio: "Effective study habits include reviewing notes soon after class, using active recall techniques, and distributing practice over multiple sessions.",
    passage: "Effective study habits include reviewing notes soon after {BLANK}, using active {BLANK} techniques, and distributing practice over multiple {BLANK}.",
    answers: ["class", "recall", "sessions"],
  },
  {
    id: "tifb-002", difficulty: "Medium", title: "Climate Change",
    audio: "Rising global temperatures are melting polar ice caps and causing sea levels to rise, threatening coastal communities worldwide.",
    passage: "Rising global temperatures are {BLANK} polar ice caps and causing sea {BLANK} to rise, threatening {BLANK} communities worldwide.",
    answers: ["melting", "levels", "coastal"],
  },
  {
    id: "tifb-003", difficulty: "Medium", title: "Urban Transport",
    audio: "Public transport systems reduce traffic congestion and carbon emissions while providing affordable mobility for city residents.",
    passage: "Public {BLANK} systems reduce traffic {BLANK} and carbon emissions while providing affordable {BLANK} for city residents.",
    answers: ["transport", "congestion", "mobility"],
  },
  {
    id: "tifb-004", difficulty: "Hard", title: "Cognitive Science",
    audio: "Working memory has a limited capacity, which is why complex tasks that require simultaneous processing of multiple pieces of information are cognitively demanding.",
    passage: "Working memory has a limited {BLANK}, which is why complex tasks that require {BLANK} processing of multiple pieces of information are cognitively {BLANK}.",
    answers: ["capacity", "simultaneous", "demanding"],
  },
  {
    id: "tifb-005", difficulty: "Easy", title: "Health and Exercise",
    audio: "Regular physical activity strengthens the cardiovascular system and reduces the risk of chronic diseases such as diabetes.",
    passage: "Regular physical activity {BLANK} the cardiovascular system and reduces the {BLANK} of chronic diseases such as {BLANK}.",
    answers: ["strengthens", "risk", "diabetes"],
  },
  {
    id: "tifb-006", difficulty: "Medium", title: "Technology",
    audio: "Smartphones have transformed communication by making information accessible at any time and from virtually any location.",
    passage: "Smartphones have {BLANK} communication by making information {BLANK} at any time and from virtually any {BLANK}.",
    answers: ["transformed", "accessible", "location"],
  },
  {
    id: "tifb-007", difficulty: "Hard", title: "Economics",
    audio: "Inflation erodes the purchasing power of currency, which is why central banks set interest rates to maintain price stability.",
    passage: "Inflation erodes the purchasing {BLANK} of currency, which is why central {BLANK} set interest rates to maintain price {BLANK}.",
    answers: ["power", "banks", "stability"],
  },
  {
    id: "tifb-008", difficulty: "Easy", title: "Environment",
    audio: "Recycling conserves natural resources, reduces waste in landfills, and lowers the energy required to produce new materials.",
    passage: "Recycling {BLANK} natural resources, reduces waste in {BLANK}, and lowers the energy required to produce new {BLANK}.",
    answers: ["conserves", "landfills", "materials"],
  },
  {
    id: "tifb-009", difficulty: "Medium", title: "Education",
    audio: "Critical thinking enables students to evaluate evidence, identify assumptions, and construct well-supported arguments.",
    passage: "Critical thinking enables students to {BLANK} evidence, identify {BLANK}, and construct well-supported {BLANK}.",
    answers: ["evaluate", "assumptions", "arguments"],
  },
  {
    id: "tifb-010", difficulty: "Hard", title: "Neuroscience",
    audio: "Neuroplasticity allows the brain to reorganise neural pathways in response to learning, experience, and recovery from injury.",
    passage: "Neuroplasticity allows the brain to {BLANK} neural pathways in response to learning, experience, and recovery from {BLANK}.",
    answers: ["reorganise", "injury"],
  },
  {
    id: "tifb-011", difficulty: "Medium", title: "Globalisation",
    audio: "Global trade agreements reduce tariffs and encourage the movement of goods, services, and capital across national borders.",
    passage: "Global trade agreements reduce {BLANK} and encourage the movement of goods, services, and capital across national {BLANK}.",
    answers: ["tariffs", "borders"],
  },
  {
    id: "tifb-012", difficulty: "Easy", title: "Public Health",
    audio: "Vaccination programmes protect communities by building herd immunity against infectious diseases.",
    passage: "Vaccination programmes protect communities by building herd {BLANK} against infectious {BLANK}.",
    answers: ["immunity", "diseases"],
  },
];

export default TYPE_IN_FILL_BLANKS;
