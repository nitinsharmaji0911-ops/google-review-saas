import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GenerateReviewParams {
  businessName: string;
  category: string;
  location?: string | null;
  selectedTopics: string[];
  selectedServices: string[];
  customerComment?: string | null;
  tone?: "natural" | "short" | "detailed";
  rating?: number;
}

export interface GeneratedReviewResult {
  review: string;
  source: "gemini" | "smart_nlp";
}

// Authentic Human Angles & Scenarios (Sounds like real smartphone reviews)
const HUMAN_REVIEW_ANGLES = [
  {
    vibe: "Casual Drop-in",
    guidance: "Casual customer who stopped by. Friendly, relaxed tone.",
    examples: [
      "Stopped by today and really loved the coffee! Super friendly staff and the pastries were fresh. Definitely coming back.",
      "Dropped in for a quick bite. Great service and the food came out fast. 10/10 experience."
    ]
  },
  {
    vibe: "Local Favorite",
    guidance: "Local customer recommending to others in the neighborhood.",
    examples: [
      "Honestly one of the best spots around here. Always good quality and the vibe is super chill.",
      "My go-to place in the area. Consistent quality and great staff every single time."
    ]
  },
  {
    vibe: "Work & Ambience",
    guidance: "Focused on atmosphere, comfortable seating, friendly baristas/staff, good music/wifi.",
    examples: [
      "Such a great place to sit and get some work done. Fast wifi, good music, and the drinks are spot on.",
      "Really cozy atmosphere. Staff doesn't rush you and everything we ordered was delicious."
    ]
  },
  {
    vibe: "Item & Taste Focused",
    guidance: "Direct appreciation for the taste, cleanliness, and freshness.",
    examples: [
      "Tried their signature coffee and bakery items this morning. Both were incredible! Super fresh.",
      "Everything tasted amazing and the place was spotless. Really happy with the service."
    ]
  },
  {
    vibe: "Short & Sweet",
    guidance: "Punchy, natural, 1-2 sentence real human review.",
    examples: [
      "Great coffee, friendly team, and quick service. Can't ask for much more!",
      "Super sweet staff and top quality food. Highly recommend checking them out!"
    ]
  }
];

// 1. Google Gemini AI Generation with Realistic Human Voice
async function generateWithGemini(
  apiKey: string,
  params: GenerateReviewParams
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.95,
      topP: 0.95,
    }
  });

  const rating = params.rating || 5;
  const randomAngle = HUMAN_REVIEW_ANGLES[Math.floor(Math.random() * HUMAN_REVIEW_ANGLES.length)];

  const toneLength = {
    short: "1-2 quick conversational sentences (around 15-25 words total).",
    natural: "2-3 natural sentences (around 30-45 words). Relaxed everyday phrasing.",
    detailed: "3-4 sentences with natural storytelling (around 50-70 words). Sounds like a genuine, detailed Google Local Guide review."
  }[params.tone || "natural"];

  const prompt = `You are a real human customer writing a quick, authentic Google Maps review on your smartphone for "${params.businessName}" (${params.category}${params.location ? `, in ${params.location}` : ""}).

Star Rating: ${rating}/5
Review Angle: ${randomAngle.vibe}
Customer Selected Highlights: ${params.selectedTopics.length > 0 ? params.selectedTopics.join(", ") : "Good quality and friendly service"}
Specific Items Ordered/Used: ${params.selectedServices.length > 0 ? params.selectedServices.join(", ") : "None"}
Customer Note: ${params.customerComment ? `"${params.customerComment}"` : "None"}
Target Length: ${toneLength}

CRITICAL RULES FOR 100% AUTHENTIC HUMAN REVIEWS:
1. TALK LIKE A REAL PERSON typing a review on Google Maps:
   - Use natural contractions ("it's", "didn't", "was really", "super", "loved the", "definitely").
   - Keep the tone warm, grounded, and conversational.
2. ABSOLUTELY BANNED AI PHRASES (NEVER USE THESE):
   - Do NOT use: "truly shines", "delightful", "deeply appreciate", "superb", "exceeded every expectation", "sets them apart", "executed to perfection", "I recently visited", "an absolute favorite", "wonderfully work-friendly environment", "nestled in", "epitome of", "testament to".
3. Write in natural first person ("I", "We").
4. Mention the selected highlights organically (e.g. "coffee was great", "pastries were fresh", "fast wifi", "staff was super helpful").
5. End naturally (e.g. "Definitely coming back!", "10/10!", "Highly recommend!", "Will be back for sure!").
6. Output ONLY the plain review text. No quotes. No intro headers.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  return text.replace(/^["']|["']$/g, "").trim();
}

// 2. Ultra-Humanized Smart NLP Fallback Templates
export function generateSmartTemplateReview(params: GenerateReviewParams): string {
  const { businessName, selectedTopics, selectedServices, customerComment, tone = "natural" } = params;

  const topicsList = selectedTopics.length > 0 ? selectedTopics : ["great quality", "friendly staff"];
  const servicesList = selectedServices.length > 0 ? selectedServices : [];
  const primaryTopic = topicsList[0].toLowerCase();
  const secondaryTopic = (topicsList[1] || topicsList[0]).toLowerCase();
  const serviceMention = servicesList.length > 0 ? ` (especially the ${servicesList.join(" and ").toLowerCase()})` : "";
  const commentAddon = customerComment ? ` ${customerComment.trim()}.` : "";

  // Short Human Templates
  const shortTemplates = [
    `Loved the ${primaryTopic} here! Super friendly staff and quick service.${commentAddon} 10/10.`,
    `Really great spot! The ${primaryTopic}${serviceMention} was so good.${commentAddon} Will definitely be back.`,
    `Quick, friendly, and great quality. The ${primaryTopic} was spot on today!`,
    `Such a good experience at ${businessName}. Loved the ${primaryTopic} and chill vibe.${commentAddon}`,
    `Great little place! The ${primaryTopic} was delicious and the team is really sweet.${commentAddon}`,
    `Honestly so impressed with the ${primaryTopic} here.${serviceMention} Highly recommend!`,
    `Top quality ${primaryTopic} and fast service. Can't ask for much more!`,
    `Stopped by today and the ${primaryTopic} was amazing.${commentAddon} Definitely coming back.`
  ];

  // Natural Human Templates
  const naturalTemplates = [
    `Stopped by ${businessName} today and really loved it! The ${primaryTopic} was so good and the staff was super welcoming.${serviceMention}${commentAddon} Definitely making this my regular spot.`,
    `Honestly one of the best places around here. The ${primaryTopic} and ${secondaryTopic} were both spot on.${serviceMention}${commentAddon} Great vibe and quick service, 10/10!`,
    `Had a really nice time at ${businessName}. Everything was fresh and the team was super attentive.${commentAddon} You can tell they care about their ${primaryTopic}. Highly recommend!`,
    `Such a cozy spot! The ${primaryTopic} was fantastic and they have a great atmosphere.${serviceMention}${commentAddon} Will definitely be bringing friends here next time.`,
    `Really happy I checked out ${businessName}! The ${primaryTopic} exceeded expectations and the service was super fast.${commentAddon} Will be back for sure!`,
    `Dropped in this morning and loved everything about it. Great ${primaryTopic}, clean space, and very polite staff.${serviceMention}${commentAddon} Worth every penny.`,
    `Always a good experience coming here. The ${primaryTopic} is consistently great and the staff is always smiling.${commentAddon} Keep up the great work!`,
    `Came here on a friend's recommendation and it didn't disappoint! The ${primaryTopic} was incredible.${serviceMention}${commentAddon} Definitely recommend checking them out.`
  ];

  // Detailed Human Templates
  const detailedTemplates = [
    `Dropped by ${businessName} today and was super impressed from start to finish. The ${primaryTopic} was fresh and full of flavor, and the ${secondaryTopic} was just as good.${serviceMention}${commentAddon} The staff was really friendly and made sure everything was taken care of. If you're anywhere in the area, definitely give this place a try!`,
    `Such a great find! Came in for a quick visit and ended up staying much longer because of the cozy vibe. The ${primaryTopic} was top tier and you can tell they take real pride in what they do.${serviceMention}${commentAddon} Clean space, fast service, and really nice people working here. Will 100% be returning soon.`,
    `Really can't say enough good things about ${businessName}. The ${primaryTopic} was outstanding and the ${secondaryTopic} was just as impressive.${serviceMention}${commentAddon} It's hard to find places with such consistent quality and friendly service these days. Easily a 5-star experience!`
  ];

  if (tone === "short") {
    return shortTemplates[Math.floor(Math.random() * shortTemplates.length)];
  } else if (tone === "detailed") {
    return detailedTemplates[Math.floor(Math.random() * detailedTemplates.length)];
  }
  return naturalTemplates[Math.floor(Math.random() * naturalTemplates.length)];
}

// 3. Unified Generation Engine
export async function generateCustomerReview(params: GenerateReviewParams): Promise<GeneratedReviewResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 0) {
    try {
      const review = await generateWithGemini(apiKey, params);
      if (review && review.length > 10) {
        return { review, source: "gemini" };
      }
    } catch (err) {
      console.warn("Gemini generation error, falling back to smart dynamic NLP:", err);
    }
  }

  return {
    review: generateSmartTemplateReview(params),
    source: "smart_nlp",
  };
}

export const generateReview = generateCustomerReview;
