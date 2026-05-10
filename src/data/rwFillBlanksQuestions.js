// Each question: passage with {BLANK} markers, a wordBank array, and answers array (in order of blanks)
const RW_FILL_BLANKS = [
  {
    id: "rwfb-001", difficulty: "Medium",
    title: "Renewable Energy",
    passage: "Solar energy has become increasingly {BLANK} over the past decade, largely due to dramatic reductions in the cost of photovoltaic panels. Governments around the world are now {BLANK} substantial investments in solar infrastructure as part of their strategies to {BLANK} carbon emissions. Critics, however, argue that solar power alone cannot {BLANK} the energy demands of modern industrial societies without improvements in battery storage technology.",
    wordBank: ["affordable", "making", "reduce", "meet", "expensive", "avoiding", "increase", "solve"],
    answers: ["affordable", "making", "reduce", "meet"],
  },
  {
    id: "rwfb-002", difficulty: "Hard",
    title: "Urban Migration",
    passage: "The {BLANK} movement of people from rural areas to cities has placed enormous {BLANK} on urban infrastructure. Housing shortages, traffic congestion, and inadequate sanitation are among the most {BLANK} consequences of rapid urbanisation. Policymakers must {BLANK} innovative approaches to urban planning if cities are to remain liveable as their populations continue to grow.",
    wordBank: ["continuous", "pressure", "visible", "adopt", "occasional", "relief", "positive", "resist"],
    answers: ["continuous", "pressure", "visible", "adopt"],
  },
  {
    id: "rwfb-003", difficulty: "Easy",
    title: "Academic Writing",
    passage: "Academic essays must present a clear {BLANK} supported by evidence drawn from {BLANK} sources. Writers should avoid {BLANK} language and ensure that all quotations are properly {BLANK} according to the required citation style.",
    wordBank: ["argument", "credible", "vague", "cited", "story", "random", "emotional", "copied"],
    answers: ["argument", "credible", "vague", "cited"],
  },
  {
    id: "rwfb-004", difficulty: "Hard",
    title: "Cognitive Science",
    passage: "Working memory is the cognitive system responsible for {BLANK} and manipulating information over short periods. Its capacity is {BLANK} and researchers have shown that holding too many items in mind {BLANK} performance on complex tasks. Training programmes that {BLANK} working memory capacity have shown modest but promising results in improving learning outcomes.",
    wordBank: ["holding", "limited", "impairs", "increase", "hiding", "unlimited", "improves", "decrease"],
    answers: ["holding", "limited", "impairs", "increase"],
  },
  {
    id: "rwfb-005", difficulty: "Medium",
    title: "Climate Policy",
    passage: "International agreements on climate change {BLANK} nations to reduce their greenhouse gas emissions by agreed targets. The challenge lies in {BLANK} compliance, since no binding enforcement mechanism currently exists. Developing nations argue that they should not be held to the same {BLANK} as industrialised countries that have historically been {BLANK} for the majority of cumulative global emissions.",
    wordBank: ["require", "ensuring", "standards", "responsible", "allow", "avoiding", "targets", "praised"],
    answers: ["require", "ensuring", "standards", "responsible"],
  },
  {
    id: "rwfb-006", difficulty: "Easy",
    title: "Digital Technology",
    passage: "The widespread {BLANK} of smartphones has fundamentally changed the way people {BLANK} with information. News, entertainment, and social connection are now {BLANK} on demand, creating both opportunities and {BLANK} for users and societies alike.",
    wordBank: ["adoption", "engage", "available", "challenges", "decline", "ignore", "restricted", "benefits"],
    answers: ["adoption", "engage", "available", "challenges"],
  },
  {
    id: "rwfb-007", difficulty: "Hard",
    title: "Behavioural Economics",
    passage: "Traditional economic theory {BLANK} that individuals make rational decisions based on available information. Behavioural economists have {BLANK} this assumption, demonstrating that people are {BLANK} influenced by cognitive biases such as anchoring and framing. Nudge theory {BLANK} these insights to design environments that guide people toward better choices without restricting their freedom.",
    wordBank: ["assumes", "challenged", "consistently", "applies", "denies", "confirmed", "rarely", "ignores"],
    answers: ["assumes", "challenged", "consistently", "applies"],
  },
  {
    id: "rwfb-008", difficulty: "Medium",
    title: "Public Health",
    passage: "Vaccination programmes have been among the most {BLANK} public health interventions in history, virtually {BLANK} diseases such as smallpox and dramatically reducing cases of polio. However, vaccine hesitancy — driven by {BLANK} and distrust of authorities — threatens to {BLANK} decades of progress in disease prevention.",
    wordBank: ["effective", "eliminating", "misinformation", "reverse", "controversial", "spreading", "facts", "accelerate"],
    answers: ["effective", "eliminating", "misinformation", "reverse"],
  },
  {
    id: "rwfb-009", difficulty: "Easy",
    title: "Higher Education",
    passage: "Universities serve two broad {BLANK}: preparing graduates for the workforce and advancing human knowledge through research. There is ongoing debate about whether higher education should {BLANK} more strongly on vocational training or {BLANK} its traditional emphasis on critical thinking and intellectual {BLANK}.",
    wordBank: ["purposes", "focus", "maintain", "breadth", "problems", "reduce", "abandon", "depth"],
    answers: ["purposes", "focus", "maintain", "breadth"],
  },
  {
    id: "rwfb-010", difficulty: "Hard",
    title: "Neuroscience",
    passage: "Neuroplasticity refers to the brain's {BLANK} to reorganise itself by forming new neural connections throughout life. This capacity, once thought to be {BLANK} to early childhood, is now known to {BLANK} into adulthood, albeit to a lesser degree. Stroke rehabilitation programmes increasingly {BLANK} neuroplasticity principles to help patients recover lost motor and language functions.",
    wordBank: ["ability", "limited", "persist", "exploit", "failure", "exclusive", "disappear", "ignore"],
    answers: ["ability", "limited", "persist", "exploit"],
  },
  {
    id: "rwfb-011", difficulty: "Medium",
    title: "Global Trade",
    passage: "Free trade agreements aim to {BLANK} trade barriers between participating nations, allowing goods and services to flow more freely across borders. {BLANK} these agreements can stimulate economic growth, they may also {BLANK} domestic industries to competition from lower-cost foreign producers. Governments must therefore {BLANK} the overall economic benefits against the social costs for affected workers and communities.",
    wordBank: ["reduce", "While", "expose", "weigh", "increase", "Unless", "protect", "ignore"],
    answers: ["reduce", "While", "expose", "weigh"],
  },
  {
    id: "rwfb-012", difficulty: "Easy",
    title: "Environmental Science",
    passage: "Deforestation is one of the leading {BLANK} to biodiversity loss worldwide. Forests {BLANK} habitat for more than half of the world's terrestrial species and play a critical role in {BLANK} carbon dioxide from the atmosphere. Sustainable forestry practices and {BLANK} land use policies are essential if we are to reverse current trends.",
    wordBank: ["contributors", "provide", "absorbing", "responsible", "barriers", "destroy", "releasing", "irresponsible"],
    answers: ["contributors", "provide", "absorbing", "responsible"],
  },
];

export default RW_FILL_BLANKS;
