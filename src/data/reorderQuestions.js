// Each question: sentences in correct order (sentences[0] is the topic sentence)
// The UI will shuffle them; the user must restore the correct order.
const REORDER_QUESTIONS = [
  {
    id: "reo-001", difficulty: "Easy", title: "Coffee and Productivity",
    sentences: [
      "Caffeine, the primary active compound in coffee, is the world's most widely consumed psychoactive substance.",
      "It works by blocking adenosine receptors in the brain, which reduces feelings of fatigue and drowsiness.",
      "As a result, moderate coffee consumption has been linked to improved concentration and short-term memory.",
      "However, excessive intake can lead to anxiety, disrupted sleep, and dependency.",
      "Most health guidelines therefore recommend limiting consumption to no more than four cups per day.",
    ],
  },
  {
    id: "reo-002", difficulty: "Medium", title: "The Printing Press",
    sentences: [
      "The invention of the printing press by Johannes Gutenberg around 1440 transformed the spread of knowledge in Europe.",
      "Before this innovation, books were copied by hand, making them expensive and accessible only to the wealthy.",
      "The press allowed texts to be reproduced quickly and cheaply, dramatically increasing literacy across the continent.",
      "This dissemination of ideas fuelled the Protestant Reformation and the Scientific Revolution of subsequent centuries.",
      "Many historians regard it as the single most important technological development of the last millennium.",
    ],
  },
  {
    id: "reo-003", difficulty: "Hard", title: "Cognitive Load Theory",
    sentences: [
      "Cognitive load theory, developed by John Sweller in the 1980s, has had a profound influence on instructional design.",
      "It distinguishes between intrinsic load, which relates to the inherent complexity of the material being learned, and extraneous load, which arises from poorly designed instruction.",
      "When the total cognitive load exceeds the capacity of working memory, learning breaks down and errors multiply.",
      "Effective educators therefore reduce unnecessary complexity and present information in formats that align with how the brain processes new knowledge.",
      "Recent research has extended the theory to digital learning environments, highlighting the particular risks of multimedia overload.",
    ],
  },
  {
    id: "reo-004", difficulty: "Medium", title: "Coral Reef Decline",
    sentences: [
      "Coral reefs support approximately twenty-five percent of all marine species despite covering less than one percent of the ocean floor.",
      "Rising sea temperatures caused by climate change trigger a process called coral bleaching, in which corals expel the algae that sustain them.",
      "Without these algae, corals turn white and become vulnerable to disease and death.",
      "Ocean acidification, caused by the absorption of excess carbon dioxide, further weakens coral skeletons.",
      "Unless emissions are sharply reduced, scientists warn that most of the world's coral reefs could be gone by 2050.",
    ],
  },
  {
    id: "reo-005", difficulty: "Easy", title: "The Water Cycle",
    sentences: [
      "The water cycle is the continuous movement of water through Earth's atmosphere, land surface, and oceans.",
      "Solar energy drives the process by causing water to evaporate from oceans, lakes, and rivers.",
      "Water vapour rises into the atmosphere, where it cools and condenses to form clouds.",
      "Precipitation then returns water to the surface as rain, snow, or hail.",
      "Runoff and groundwater flow carry this water back to the oceans, completing the cycle.",
    ],
  },
  {
    id: "reo-006", difficulty: "Hard", title: "Monetary Policy",
    sentences: [
      "Central banks use monetary policy to manage inflation and support economic stability.",
      "The primary instrument is the benchmark interest rate, which influences the cost of borrowing throughout the economy.",
      "When inflation rises above target, the central bank raises rates to cool demand and reduce upward price pressure.",
      "Conversely, in a recession, lowering rates stimulates borrowing and investment, supporting economic recovery.",
      "However, the effectiveness of monetary policy depends on how quickly households and businesses respond to interest rate changes.",
    ],
  },
  {
    id: "reo-007", difficulty: "Medium", title: "Reading and the Brain",
    sentences: [
      "Reading is one of the most complex cognitive tasks the human brain performs.",
      "It requires the simultaneous integration of visual processing, phonological decoding, and semantic comprehension.",
      "Functional MRI studies show that proficient readers activate a wide network of brain regions, including areas associated with spoken language.",
      "Poor readers, by contrast, often show underactivation in the left temporoparietal cortex, a region crucial for converting letters to sounds.",
      "These findings have informed evidence-based interventions for dyslexia that target phonological awareness skills.",
    ],
  },
  {
    id: "reo-008", difficulty: "Easy", title: "The Benefits of Exercise",
    sentences: [
      "Regular physical activity is one of the most powerful tools available for improving overall health.",
      "It reduces the risk of cardiovascular disease, type 2 diabetes, and several forms of cancer.",
      "Exercise also has well-documented mental health benefits, including reductions in anxiety and depression.",
      "Despite this evidence, surveys consistently show that a majority of adults in developed countries do not meet recommended activity guidelines.",
      "Public health campaigns and urban design that encourages walking and cycling are among the strategies being used to address this gap.",
    ],
  },
  {
    id: "reo-009", difficulty: "Hard", title: "Quantum Computing",
    sentences: [
      "Quantum computers exploit the principles of quantum mechanics to process information in fundamentally different ways from classical computers.",
      "While classical computers store information as binary bits, quantum computers use quantum bits, or qubits, which can exist in multiple states simultaneously through a property called superposition.",
      "This allows quantum computers to explore many potential solutions to a problem in parallel, offering exponential speedups for certain tasks.",
      "Applications such as cryptography, drug discovery, and optimisation problems are expected to benefit enormously from this technology.",
      "However, building stable quantum systems that can operate without errors remains a formidable engineering challenge.",
    ],
  },
  {
    id: "reo-010", difficulty: "Medium", title: "Microplastics",
    sentences: [
      "Microplastics are tiny plastic fragments measuring less than five millimetres in diameter.",
      "They originate from the breakdown of larger plastic items or are manufactured at small sizes for use in cosmetics and industrial processes.",
      "These particles have been detected in oceans, rivers, soil, and even the air we breathe.",
      "Research has found microplastics in human blood, lungs, and placental tissue, raising concerns about potential health effects.",
      "Reducing plastic production and improving waste management systems are considered the most effective long-term solutions.",
    ],
  },
  {
    id: "reo-011", difficulty: "Easy", title: "Social Media and Youth",
    sentences: [
      "Social media platforms have become central to the social lives of young people in the digital age.",
      "They offer opportunities for self-expression, community building, and access to information on a global scale.",
      "However, studies have linked heavy use to higher rates of anxiety, depression, and poor body image, particularly among adolescent girls.",
      "Researchers believe that constant comparison with idealised images and exposure to cyberbullying are key mechanisms driving these negative outcomes.",
      "Policymakers and platform companies are now under pressure to introduce age verification, screen time limits, and content moderation measures.",
    ],
  },
  {
    id: "reo-012", difficulty: "Hard", title: "The Gene-Environment Interaction",
    sentences: [
      "The longstanding nature-versus-nurture debate in psychology has largely given way to an understanding that genes and environment interact in complex ways.",
      "Epigenetics — the study of changes in gene expression caused by environmental factors — has been particularly illuminating.",
      "Research has shown that experiences such as childhood trauma, chronic stress, or malnutrition can chemically modify DNA, influencing which genes are switched on or off.",
      "These modifications can persist across the lifespan and, in some cases, may even be transmitted to subsequent generations.",
      "Such findings underscore the importance of early intervention programmes that improve conditions for children growing up in adversity.",
    ],
  },
];

export default REORDER_QUESTIONS;
