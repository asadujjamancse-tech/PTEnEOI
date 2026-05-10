const RETELL_QUESTIONS = [
  {
    id: "rtl-001", title: "The Rise of Renewable Energy", difficulty: "Medium",
    audio: "Over the past two decades, the global energy landscape has undergone a dramatic transformation. Solar and wind power, once considered fringe technologies, now account for a growing share of electricity generation in many countries. The cost of solar panels has fallen by more than ninety percent since 2010, making renewable energy competitive with coal and natural gas in most markets. Governments are accelerating this transition through subsidies and regulatory mandates, while private investment in clean energy has surged. However, challenges remain: the intermittent nature of wind and solar power requires new solutions for energy storage and grid management.",
    keywords: ["renewable energy", "solar", "wind", "cost reduction", "storage", "grid"],
  },
  {
    id: "rtl-002", title: "Urbanisation and Its Consequences", difficulty: "Medium",
    audio: "For the first time in human history, more than half the world's population lives in cities. This shift, driven by economic opportunity and demographic growth, is reshaping societies on every continent. Urban centres generate the majority of global GDP, but they also concentrate poverty, pollution, and inequality. Rapid urbanisation strains infrastructure, particularly in developing nations where cities lack the resources to build adequate housing, transport systems, and sanitation. Planners are exploring compact city models, mixed-use zoning, and green infrastructure as strategies to make cities more sustainable and liveable for growing populations.",
    keywords: ["urbanisation", "cities", "GDP", "infrastructure", "housing", "sustainability"],
  },
  {
    id: "rtl-003", title: "The Psychology of Decision Making", difficulty: "Hard",
    audio: "Classical economics assumed that humans are rational agents who consistently make decisions in their own best interest. However, decades of psychological research have overturned this assumption. Behavioural economists Daniel Kahneman and Amos Tversky demonstrated that people rely on cognitive shortcuts called heuristics, which introduce systematic biases into decision making. Loss aversion, for example, means that people feel the pain of losing something more intensely than the pleasure of gaining an equivalent thing. These insights have transformed fields from public policy to marketing, as organisations now design choice environments, or nudges, to guide people toward better decisions without restricting their freedom.",
    keywords: ["decision making", "heuristics", "cognitive bias", "loss aversion", "nudge", "behavioural economics"],
  },
  {
    id: "rtl-004", title: "Ocean Plastic Pollution", difficulty: "Easy",
    audio: "Plastic pollution in the world's oceans has become one of the most urgent environmental challenges of our time. An estimated eight million tonnes of plastic enter the ocean every year, where it breaks down into microplastics that enter the food chain. Marine animals, including sea turtles, seabirds, and whales, ingest or become entangled in plastic debris, often with fatal results. Coastal communities that depend on fishing and tourism are particularly affected. While recycling and waste reduction are part of the solution, researchers are also developing technologies to remove plastic from the ocean, including large-scale collection systems and plastic-eating enzymes.",
    keywords: ["ocean", "microplastics", "marine life", "recycling", "plastic removal", "food chain"],
  },
  {
    id: "rtl-005", title: "Artificial Intelligence in Medicine", difficulty: "Hard",
    audio: "Artificial intelligence is beginning to transform healthcare in ways that were unimaginable a decade ago. Machine learning algorithms trained on millions of medical images can now detect cancer, diabetic retinopathy, and other conditions with accuracy that rivals or exceeds that of specialist physicians. Natural language processing tools can read thousands of patient records to identify risk factors and recommend treatments. AI-driven drug discovery is accelerating the development of new medicines by predicting which molecular compounds are likely to be effective and safe. Despite these advances, important questions about data privacy, algorithmic bias, and the appropriate role of human judgment in clinical decisions remain unresolved.",
    keywords: ["AI", "healthcare", "cancer detection", "drug discovery", "data privacy", "bias"],
  },
  {
    id: "rtl-006", title: "The Importance of Sleep", difficulty: "Easy",
    audio: "Sleep is often treated as a luxury in modern society, but research increasingly shows it is a biological necessity. During sleep, the brain consolidates memories, flushes out toxic proteins, and regulates hormones that control appetite, mood, and immune function. Chronic sleep deprivation has been linked to increased risks of obesity, diabetes, cardiovascular disease, and mental health disorders. The recommended amount of sleep for adults is seven to nine hours per night, yet surveys consistently show that many people fall short of this target. Experts point to the prevalence of artificial light, screen use before bed, and demanding work schedules as major contributors to the global sleep crisis.",
    keywords: ["sleep", "memory", "hormones", "health risks", "sleep deprivation", "artificial light"],
  },
  {
    id: "rtl-007", title: "Supply Chain Disruption", difficulty: "Hard",
    audio: "The COVID-19 pandemic exposed the fragility of global supply chains that had been optimised for efficiency at the expense of resilience. Manufacturers that relied on just-in-time delivery from distant suppliers found themselves unable to source components when factories shut down and shipping networks were disrupted. The resulting shortages of semiconductors, medicines, and consumer goods had far-reaching economic consequences. In response, many companies are now diversifying their supplier bases, moving production closer to home, and holding larger inventories as a buffer against future disruptions. Governments are also incentivising domestic production of strategic goods such as microchips and pharmaceuticals.",
    keywords: ["supply chain", "COVID-19", "just-in-time", "semiconductors", "resilience", "nearshoring"],
  },
  {
    id: "rtl-008", title: "Language Extinction", difficulty: "Medium",
    audio: "Of the approximately seven thousand languages spoken in the world today, linguists estimate that half will disappear by the end of this century. Language extinction is driven by economic pressures that push communities to adopt dominant languages for education and employment, by migration and urbanisation, and in some cases by historical policies that suppressed minority languages. When a language dies, humanity loses not just a communication system but an entire worldview encoded in unique words, metaphors, and grammatical structures. Efforts to reverse language decline include documentary projects to record grammar and vocabulary, immersive education programmes, and community-led revitalisation initiatives.",
    keywords: ["language extinction", "minority languages", "documentation", "revitalisation", "worldview", "urbanisation"],
  },
  {
    id: "rtl-009", title: "Food Security and Climate Change", difficulty: "Medium",
    audio: "Climate change poses a mounting threat to global food security. Rising temperatures, shifting rainfall patterns, and more frequent extreme weather events are reducing crop yields in many regions, particularly in tropical and subtropical areas that are already food-insecure. Staple crops such as wheat, rice, and maize are sensitive to heat stress, and projections suggest yields could fall by up to twenty-five percent by mid-century if emissions are not reduced. At the same time, the global population is expected to reach nearly ten billion by 2050, intensifying demand for food. Sustainable agricultural practices, crop diversification, and reduced food waste are among the strategies being promoted to address this challenge.",
    keywords: ["food security", "climate change", "crop yields", "population growth", "sustainable agriculture", "food waste"],
  },
  {
    id: "rtl-010", title: "The History of the Internet", difficulty: "Easy",
    audio: "The internet began as a research project funded by the United States Department of Defense in the 1960s. Known as ARPANET, it was designed to allow computers at different universities to share data. The invention of the World Wide Web by Tim Berners-Lee in 1989 made the internet accessible to ordinary users by providing a system of linked pages that could be navigated using a browser. Commercial internet services expanded rapidly through the 1990s, and the introduction of smartphones in the 2000s put internet access in billions of pockets. Today, the internet underpins global commerce, communication, and culture, though it also raises concerns about privacy, misinformation, and digital inequality.",
    keywords: ["ARPANET", "World Wide Web", "Tim Berners-Lee", "browser", "smartphones", "digital inequality"],
  },
];

export default RETELL_QUESTIONS;
