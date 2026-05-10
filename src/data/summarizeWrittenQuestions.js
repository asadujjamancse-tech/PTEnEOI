const QUESTIONS = [
  {
    id: "sw-01",
    title: "Artificial Intelligence in Industry",
    difficulty: "Medium",
    passage: "Artificial intelligence is rapidly transforming industries worldwide. Machine learning algorithms now assist in medical diagnosis, enabling doctors to detect diseases earlier than ever before. In finance, AI-powered systems analyse vast datasets to predict market trends and manage risk. Manufacturing has been revolutionised through robotic automation that improves precision and reduces costs. However, critics argue that this technological revolution threatens millions of jobs and raises serious questions about privacy and algorithmic bias. The challenge for society is harnessing AI's potential while managing its risks responsibly.",
    modelAnswer: "Artificial intelligence is revolutionising diverse sectors — from healthcare and finance to manufacturing — while simultaneously raising serious societal concerns about job displacement, privacy, and algorithmic bias that must be managed responsibly.",
  },
  {
    id: "sw-02",
    title: "Climate Change and Extreme Weather",
    difficulty: "Medium",
    passage: "Climate change is accelerating at an unprecedented rate, according to recent scientific reports. Global temperatures have risen by approximately 1.2 degrees Celsius above pre-industrial levels, causing widespread ecological disruption. Polar ice caps are melting at record speeds, contributing to rising sea levels that threaten coastal communities. Extreme weather events, including hurricanes, droughts, and wildfires, have increased in both frequency and intensity. Scientists warn that without immediate and drastic reductions in greenhouse gas emissions, the most severe consequences may become irreversible within this decade.",
    modelAnswer: "Climate change, driven by rising global temperatures, is causing accelerating ice melt, rising sea levels, and increasingly frequent extreme weather events, with scientists urging immediate emissions reductions to prevent irreversible environmental damage.",
  },
  {
    id: "sw-03",
    title: "The Rise of Remote Work",
    difficulty: "Easy",
    passage: "The COVID-19 pandemic fundamentally changed the way millions of people work. Remote work, once considered a privilege for a select few, rapidly became the norm for knowledge workers across the globe. Many employees discovered that working from home offered significant benefits, including flexible schedules, reduced commuting time, and improved work-life balance. However, remote work also introduced new challenges, such as social isolation, difficulties in collaboration, and the blurring of boundaries between professional and personal life. Companies are now adopting hybrid models that blend remote and in-office work to capture the benefits of both approaches.",
    modelAnswer: "The pandemic normalised remote work globally, revealing both significant benefits such as flexibility and reduced commuting and notable drawbacks including isolation and collaboration challenges, prompting companies to adopt hybrid models that combine the advantages of both environments.",
  },
  {
    id: "sw-04",
    title: "Urban Population Growth",
    difficulty: "Hard",
    passage: "Urbanisation is one of the defining demographic trends of the twenty-first century. For the first time in human history, more than half the world's population lives in cities, and this proportion is expected to rise to two-thirds by 2050. Rapid urban growth brings significant economic opportunities, including access to employment, education, and healthcare. However, it also generates formidable challenges, including overburdened infrastructure, housing shortages, environmental degradation, and rising inequality. Sustainable urban planning, which prioritises green spaces, public transport, and affordable housing, is increasingly recognised as essential for ensuring that cities remain liveable as they continue to grow.",
    modelAnswer: "Urbanisation, which will concentrate two-thirds of the global population in cities by 2050, offers substantial economic opportunities in employment and services while simultaneously demanding sustainable planning to address infrastructure strain, housing shortages, and environmental degradation.",
  },
  {
    id: "sw-05",
    title: "Social Media and Mental Health",
    difficulty: "Medium",
    passage: "Research into the effects of social media on mental health has produced mixed findings. Several studies suggest that excessive use of platforms such as Instagram and TikTok is associated with increased rates of anxiety, depression, and poor self-esteem, particularly among adolescents. The mechanisms proposed include social comparison, cyberbullying, and the displacement of sleep and face-to-face interaction. However, other researchers argue that social media can foster a sense of community, provide emotional support, and facilitate access to mental health resources. The impact appears to depend heavily on how platforms are used and by whom, suggesting that passive scrolling is more harmful than active, purposeful engagement.",
    modelAnswer: "While research links excessive social media use to anxiety and depression — especially through social comparison and reduced sleep among adolescents — other evidence highlights its potential to build community and provide mental health support, with impact depending largely on the nature of engagement.",
  },
  {
    id: "sw-06",
    title: "Antibiotic Resistance",
    difficulty: "Hard",
    passage: "Antimicrobial resistance is widely regarded by health authorities as one of the most serious global public health threats of the coming decades. The overuse and misuse of antibiotics in both human medicine and agricultural settings have accelerated the natural evolutionary process by which bacteria develop resistance to drugs. As a result, infections that were once easily treatable now require more expensive treatments, longer hospital stays, and carry a higher risk of mortality. The World Health Organisation estimates that drug-resistant infections could cause ten million deaths annually by 2050 if no action is taken. Addressing this crisis requires coordinated international action, stricter prescribing regulations, investment in new drug development, and public education campaigns.",
    modelAnswer: "The accelerating overuse of antibiotics in medicine and agriculture is driving antimicrobial resistance, a global health crisis that could cause ten million annual deaths by 2050 and requires urgent coordinated action through stricter regulations, new drug development, and public education.",
  },
  {
    id: "sw-07",
    title: "The Value of Sleep",
    difficulty: "Easy",
    passage: "Sleep is increasingly recognised as a fundamental pillar of good health, alongside diet and exercise. During sleep, the brain consolidates memories, processes emotions, and clears toxic waste products linked to neurodegenerative diseases. The body repairs tissues, synthesises hormones, and strengthens immune function. Despite its importance, sleep deprivation is widespread in modern society, driven by long working hours, excessive screen time, and social pressures. Chronic sleep deficiency has been linked to a range of serious health conditions, including obesity, diabetes, cardiovascular disease, and depression. Public health experts are calling for greater awareness of sleep hygiene and policy changes, such as later school start times, to address what some describe as a global sleep crisis.",
    modelAnswer: "Sleep, now recognised as equally vital to health as diet and exercise, supports memory, immune function, and disease prevention, yet widespread sleep deprivation driven by modern lifestyles is linked to serious conditions including obesity and depression, prompting calls for policy reform.",
  },
  {
    id: "sw-08",
    title: "Renewable Energy Transition",
    difficulty: "Medium",
    passage: "The global transition to renewable energy sources is accelerating as countries seek to reduce their dependence on fossil fuels and meet climate commitments. Solar and wind power have become the cheapest sources of new electricity generation in most parts of the world, driven by dramatic reductions in technology costs over the past decade. However, the intermittent nature of these energy sources presents significant challenges for grid stability, requiring investment in energy storage technologies and smart grid infrastructure. Additionally, the transition raises questions about energy security, the economic impact on fossil fuel-dependent communities, and the environmental costs of mining the minerals required for batteries and solar panels.",
    modelAnswer: "While solar and wind power have become the world's cheapest electricity sources, accelerating the global shift away from fossil fuels, the renewable energy transition still faces major challenges including grid stability, energy storage, and the social and environmental costs of mining battery materials.",
  },
];

export default QUESTIONS;
