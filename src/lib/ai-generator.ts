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

// 1. Review Angles Categorized by Star Rating
// 1. Review Angles Categorized by Category & Star Rating
const NUTRITION_POSITIVE_ANGLES = [
  { vibe: "Authenticity & Importer Seal Verified", guidance: "Checked scratch code and batch number on the tub, 100% genuine and verified product." },
  { vibe: "Gym Lifter & Workout Results", guidance: "Lifter/athlete getting great muscle recovery, clean protein mixability, and steady gym progress." },
  { vibe: "Honest Advice & Guidance", guidance: "Owner gave genuine recommendations for fitness goals rather than pushing expensive products." },
  { vibe: "Best Value & Fair Pricing", guidance: "Compared prices online and found better or matched deals locally with instant product in hand." },
  { vibe: "Huge Brand Variety & Flavors", guidance: "Impressed by the wide range of top imported and domestic brands and fresh flavor stock." },
  { vibe: "Quick Counter Service & Trust", guidance: "Quick, polite, knowledgeable counter service. Dependable and trustworthy store in the city." },
  { vibe: "Trainer / Friend Recommended", guidance: "Recommended by gym coach or workout buddies and completely satisfied with the quality." },
  { vibe: "Healthy Fitness Nutrition", guidance: "Grabbed daily health essentials like high protein peanut butter, oats, multivitamins, and fish oil." },
  { vibe: "Long-Time Regular Customer", guidance: "Has been buying monthly supplement stacks here for a long time with consistent trust." },
  { vibe: "Short & Punchy 5-Star", guidance: "Punchy, 1-2 sentence real review praising authentic supplements and great service." },
];

const CAFE_POSITIVE_ANGLES = [
  { vibe: "Casual Drop-in", guidance: "Casual customer who stopped by. Friendly, relaxed, satisfied tone." },
  { vibe: "Local Favorite", guidance: "Local customer recommending to others in the neighborhood. 5/5 stars." },
  { vibe: "Ambience & Vibe", guidance: "Pleasant atmosphere, comfortable seating, friendly staff, good music/vibe." },
  { vibe: "Taste & Freshness", guidance: "Direct appreciation for the taste, cleanliness, and freshness." },
  { vibe: "Short & Sweet", guidance: "Punchy, natural, 1-2 sentence real human review." },
];

const GENERAL_POSITIVE_ANGLES = [
  { vibe: "Local Favorite & Recommendation", guidance: "Local customer recommending to others in the area. 5/5 stars." },
  { vibe: "Great Value & Quality", guidance: "Direct appreciation for the quality, fair pricing, and trustworthy service." },
  { vibe: "Helpful & Attentive Team", guidance: "Warm, polite, and welcoming staff who made the visit smooth." },
  { vibe: "First-Time Buyer Delight", guidance: "First visit, exceeded expectations with cleanliness, selection, and advice." },
  { vibe: "Quick & Convenient", guidance: "Fast, efficient service and pleasant experience." },
  { vibe: "Short & Sweet", guidance: "Punchy, natural, 1-2 sentence real human review." },
];

const MIXED_REVIEW_ANGLES = [
  {
    vibe: "Hit or Miss",
    guidance: "Balanced 3-star review. Some parts were okay, but other aspects were lacking.",
  },
  {
    vibe: "Decent but Flawed",
    guidance: "Average visit. Highlight what was acceptable and what needs noticeable improvement.",
  },
];

const CRITICAL_REVIEW_ANGLES = [
  {
    vibe: "Disappointed Customer",
    guidance: "1-2 star review. Frustrated or dissatisfied with quality, service, or long delays.",
  },
  {
    vibe: "Poor Service & Attentiveness",
    guidance: "1-2 star review. Staff was slow, dismissive, or inattentive. Expected better.",
  },
  {
    vibe: "Quality & Value Issue",
    guidance: "1-2 star review. Subpar experience and not worth the cost or wait time.",
  },
];

// 2. Google Gemini AI Generation with Realistic Rating-Aware Voice & 2s Timeout
let cachedGenAI: GoogleGenerativeAI | null = null;
function getGenAI(apiKey: string): GoogleGenerativeAI {
  if (!cachedGenAI) {
    cachedGenAI = new GoogleGenerativeAI(apiKey);
  }
  return cachedGenAI;
}

function timeoutAfter<T>(promise: Promise<T>, ms: number, message = "Timeout"): Promise<T> {
  let timer: NodeJS.Timeout;
  const timerPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timerPromise]).finally(() => clearTimeout(timer));
}

async function generateWithGemini(
  apiKey: string,
  params: GenerateReviewParams
): Promise<string> {
  const genAI = getGenAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash-lite",
    generationConfig: {
      temperature: 0.85,
      maxOutputTokens: 180,
    },
  });

  const rating = params.rating ? Math.min(5, Math.max(1, Math.round(params.rating))) : 5;
  const isNegative = rating <= 2;
  const isMixed = rating === 3;

  const categoryLower = (params.category || "").toLowerCase();
  const isNutrition = categoryLower.includes("nutrition") || categoryLower.includes("supplement");
  const isCafe = categoryLower.includes("cafe") || categoryLower.includes("bakery") || categoryLower.includes("coffee");

  const positiveAngles = isNutrition
    ? NUTRITION_POSITIVE_ANGLES
    : isCafe
    ? CAFE_POSITIVE_ANGLES
    : GENERAL_POSITIVE_ANGLES;

  const anglesPool = isNegative
    ? CRITICAL_REVIEW_ANGLES
    : isMixed
    ? MIXED_REVIEW_ANGLES
    : positiveAngles;

  const randomAngle = anglesPool[Math.floor(Math.random() * anglesPool.length)];

  const toneLength = {
    short: "1-2 quick conversational sentences (around 15-25 words total).",
    natural: "2-3 natural sentences (around 30-45 words). Relaxed everyday phrasing.",
    detailed: "3-4 sentences with natural storytelling (around 50-70 words). Sounds like a genuine Google Local Guide review.",
  }[params.tone || "natural"];

  let sentimentInstructions = "";
  if (isNegative) {
    sentimentInstructions = `
CRITICAL SENTIMENT REQUIREMENT: THIS IS A NEGATIVE ${rating}-STAR REVIEW.
- Express genuine customer disappointment, frustration, or dissatisfaction with this business.
- Point out what went wrong honestly (${params.selectedTopics.length > 0 ? params.selectedTopics.join(", ") : "slow service, subpar quality"}).
- ABSOLUTELY BANNED WORDS FOR NEGATIVE REVIEWS: Do NOT say "loved", "great", "10/10", "amazing", "superb", "highly recommend", "definitely coming back", "best".
- End naturally for a negative review (e.g. "Really expected better.", "Needs serious improvement.", "Won't be returning anytime soon.", "Hope management takes note of this.").`;
  } else if (isMixed) {
    sentimentInstructions = `
CRITICAL SENTIMENT REQUIREMENT: THIS IS AN AVERAGE / MIXED 3-STAR REVIEW.
- Balanced perspective. Mention what was okay, but point out what fell short or was underwhelming (${params.selectedTopics.length > 0 ? params.selectedTopics.join(", ") : "service could be better"}).
- ABSOLUTELY BANNED: Do NOT give 10/10 or say "perfect" or "flawless".
- End naturally for a 3-star review (e.g. "Decent spot, but has room for improvement.", "Average experience overall.", "Okay, but could be better.").`;
  } else {
    sentimentInstructions = `
CRITICAL SENTIMENT REQUIREMENT: THIS IS A POSITIVE ${rating}-STAR REVIEW.
- Warm, enthusiastic, authentic appreciation for the highlights (${params.selectedTopics.length > 0 ? params.selectedTopics.join(", ") : "great quality and friendly service"}).
- End naturally for a positive review (e.g. "Definitely coming back!", "10/10!", "Highly recommend!", "Will be back for sure!").`;
  }

  const prompt = `You are a real human customer writing a quick, authentic Google Maps review on your smartphone for "${params.businessName}" (${params.category}${params.location ? `, in ${params.location}` : ""}).

Star Rating: ${rating}/5
Review Angle: ${randomAngle.vibe} (${randomAngle.guidance})
Customer Selected Notes/Topics: ${params.selectedTopics.length > 0 ? params.selectedTopics.join(", ") : (isNegative ? "Poor experience, slow service" : "Good quality and friendly service")}
Specific Items Mentioned: ${params.selectedServices.length > 0 ? params.selectedServices.join(", ") : "None"}
Customer Note: ${params.customerComment ? `"${params.customerComment}"` : "None"}
Target Length: ${toneLength}

${sentimentInstructions}

MANDATORY UNIQUENESS & REAL-HUMAN WRITING RULES:
1. Every review MUST be completely unique, fresh, and distinct. Vary opening words, sentence structure, and personal angle. Never use repetitive template formulas.
2. Contextual Accuracy: Match the business type (${params.category}). For a supplement/sports nutrition store, write from the perspective of an everyday gym-goer, athlete, or fitness enthusiast (talk about genuine products, seals, protein mixability, workouts, honest advice — NEVER mention cafe tables, dining, or office work).
3. TALK LIKE A REAL LOCAL CUSTOMER:
   - Use natural contractions ("it's", "wasn't", "didn't", "was really").
   - Mention the selected items or topics naturally without sounding like an advertisement.
4. ABSOLUTELY BANNED CORPORATE/AI JARGON:
   - Do NOT use: "truly shines", "delightful", "deeply appreciate", "superb", "exceeded every expectation", "sets them apart", "executed to perfection", "I recently visited", "an absolute favorite", "wonderfully work-friendly environment", "nestled in", "epitome of", "testament to", "culinary delight", "chilled here to get some work done".
5. Write in natural first person ("I", "We").
6. Output ONLY the plain review text. No quotes. No intro headers.`;

  // Race with 2,000ms timeout so customers never wait at the counter
  const result = await timeoutAfter(
    model.generateContent(prompt),
    2000,
    "Gemini call timed out after 2000ms"
  );
  const text = result.response.text().trim();
  return text.replace(/^["']|["']$/g, "").trim();
}

// 3. Ultra-Humanized Smart NLP Fallback Templates (Rating-Aware)
export function generateSmartTemplateReview(params: GenerateReviewParams): string {
  const { businessName, selectedTopics, selectedServices, customerComment, tone = "natural", rating = 5 } = params;

  const validRating = Math.min(5, Math.max(1, Math.round(rating)));
  const isNegative = validRating <= 2;
  const isMixed = validRating === 3;

  const topicsList = selectedTopics.length > 0
    ? selectedTopics
    : isNegative
    ? ["poor service", "long wait"]
    : isMixed
    ? ["average service", "ordinary quality"]
    : ["great quality", "friendly staff"];

  const servicesList = selectedServices.length > 0 ? selectedServices : [];
  const primaryTopic = topicsList[0].toLowerCase();
  const secondaryTopic = (topicsList[1] || topicsList[0]).toLowerCase();
  const serviceMention = servicesList.length > 0 ? ` (especially the ${servicesList.join(" and ").toLowerCase()})` : "";
  const commentAddon = customerComment ? ` ${customerComment.trim()}.` : "";

  // A. NEGATIVE REVIEWS (1 & 2 Stars)
  if (isNegative) {
    const shortNegative = [
      `Really disappointed with the ${primaryTopic} here.${commentAddon} Needs major improvement.`,
      `Had a frustrating experience. The ${primaryTopic}${serviceMention} was not good at all.${commentAddon} Expected much better.`,
      `Poor service and the ${primaryTopic} was below average.${commentAddon} Won't be coming back.`,
      `Very slow service and disappointing ${primaryTopic}.${commentAddon} Not worth the visit.`,
      `Unfortunately a ${validRating}-star visit. The ${primaryTopic} was subpar and staff was unhelpful.${commentAddon}`,
    ];

    const naturalNegative = [
      `Unfortunately had a very disappointing experience at ${businessName}. The ${primaryTopic} was not up to standard and we had to wait way too long.${serviceMention}${commentAddon} Definitely expected better for the price.`,
      `Was hoping for a good visit to ${businessName}, but was let down. The staff seemed disorganized and the ${primaryTopic} was substandard.${commentAddon} Needs serious management attention.`,
      `Disappointing visit today. The ${primaryTopic} was poor and the service was unattentive.${serviceMention}${commentAddon} Sadly won't be returning anytime soon.`,
      `Not happy with the experience at ${businessName}. The ${primaryTopic} was cold and the wait time was ridiculous.${commentAddon} Hope they address these issues.`,
    ];

    const detailedNegative = [
      `Had a really frustrating experience at ${businessName} today. We waited an unusually long time, only to be served ${primaryTopic} that was subpar and lacked freshness.${serviceMention}${commentAddon} The team seemed completely overwhelmed and indifferent to customer complaints. Given the reputation, this was far below expectations. Won't be returning.`,
      `Deeply disappointed with our visit to ${businessName}. We came in expecting quality service, but the ${primaryTopic} was below average and the customer service was poor.${serviceMention}${commentAddon} Definitely not worth the money or the wait. Hope management takes customer feedback seriously and makes necessary changes.`,
    ];

    if (tone === "short") return shortNegative[Math.floor(Math.random() * shortNegative.length)];
    if (tone === "detailed") return detailedNegative[Math.floor(Math.random() * detailedNegative.length)];
    return naturalNegative[Math.floor(Math.random() * naturalNegative.length)];
  }

  // B. MIXED / AVERAGE REVIEWS (3 Stars)
  if (isMixed) {
    const shortMixed = [
      `Average experience. The ${primaryTopic} was okay, but service was quite slow.${commentAddon}`,
      `Decent spot, but has room for improvement. The ${primaryTopic} was hit or miss.${commentAddon}`,
      `Fair experience at ${businessName}. Nothing special, but not terrible either.${commentAddon}`,
      `The ${primaryTopic} was decent, but expected a bit more for the price.${commentAddon}`,
    ];

    const naturalMixed = [
      `Visited ${businessName} today and had a mixed experience. The ${primaryTopic} was decent, but the wait time and service could definitely be improved.${serviceMention}${commentAddon} Might give them another shot later.`,
      `An okay spot in the area. The atmosphere is fine, but the ${primaryTopic} was just average.${commentAddon} A 3-star visit overall.`,
      `Decent place with potential. The ${primaryTopic} was good, but the service was a little disorganized today.${serviceMention}${commentAddon}`,
    ];

    const detailedMixed = [
      `Mixed feelings about our visit to ${businessName}. While the setting is nice, the ${primaryTopic} and service were fairly inconsistent.${serviceMention}${commentAddon} It has potential, but definitely needs more attention to speed and consistency. Decent for a quick stop, but nothing extraordinary.`,
    ];

    if (tone === "short") return shortMixed[Math.floor(Math.random() * shortMixed.length)];
    if (tone === "detailed") return detailedMixed[Math.floor(Math.random() * detailedMixed.length)];
    return naturalMixed[Math.floor(Math.random() * naturalMixed.length)];
  }

  // C. POSITIVE REVIEWS (4 & 5 Stars)
  const categoryLower = (params.category || "").toLowerCase();
  const isNutrition = categoryLower.includes("nutrition") || categoryLower.includes("supplement");

  if (isNutrition) {
    const nutritionShort = [
      `100% genuine supplements and best prices in town! The ${primaryTopic}${serviceMention} is authentic. 10/10.`,
      `Awesome store! Verified the importer seal on my purchase. The ${primaryTopic} is totally genuine.${commentAddon}`,
      `Super helpful guidance on supplements. Great collection of ${primaryTopic}${serviceMention}!`,
      `Best spot in the area for original whey protein and gym essentials. Great ${primaryTopic}!`,
      `Reliable, authentic, and fast service. Really happy with the ${primaryTopic} here.${commentAddon}`,
      `Honest advice and genuine products. Verified the batch code myself.${serviceMention} Highly recommend!`,
    ];

    const nutritionNatural = [
      `Been getting my workout supplements from ${businessName} and they never disappoint. The ${primaryTopic} is 100% genuine and the team gives honest advice instead of pushing costly products.${serviceMention}${commentAddon} Easily my go-to fitness store.`,
      `Checked the scratch code and batch number on my ${primaryTopic} and it was completely verified and authentic. Hands down the best prices in town with great stock.${serviceMention}${commentAddon} Definitely coming back!`,
      `Really good experience shopping at ${businessName}. The owner is knowledgeable and helped me pick the right ${primaryTopic} for my fitness goals.${serviceMention}${commentAddon} 10/10 service!`,
      `My workout partner recommended ${businessName} for authentic gym supplements, and it lived up to the hype. Top quality ${primaryTopic} with original seals.${serviceMention}${commentAddon} Highly recommend checking them out!`,
      `Super clean and well-stocked store! Picked up some ${primaryTopic} today and the billing was really quick.${serviceMention}${commentAddon} Great to have an authorized, genuine dealer around.`,
      `Finding 100% authentic gym supplements can be tricky, but ${businessName} is totally trustworthy. Great quality ${primaryTopic} and super helpful staff.${serviceMention}${commentAddon} Will be back for sure!`,
    ];

    const nutritionDetailed = [
      `Dropped by ${businessName} today for my fitness supplement stack. Really impressed with their wide collection of authentic domestic and imported brands. The ${primaryTopic} was sealed with original importer tags and batch verified.${serviceMention}${commentAddon} The staff knows their products well and gave honest, non-pushy recommendations. Easily a 5-star experience for any lifter or athlete!`,
      `Such a trustworthy supplement store! Came in looking for ${primaryTopic} and was really pleased with the honest guidance and competitive pricing.${serviceMention}${commentAddon} Clean shop, genuine stock, and fast billing. If you're serious about your workouts and want guaranteed authentic supplements, definitely visit ${businessName}.`,
    ];

    if (tone === "short") return nutritionShort[Math.floor(Math.random() * nutritionShort.length)];
    if (tone === "detailed") return nutritionDetailed[Math.floor(Math.random() * nutritionDetailed.length)];
    return nutritionNatural[Math.floor(Math.random() * nutritionNatural.length)];
  }

  const shortTemplates = [
    `Loved the ${primaryTopic} here! Super friendly staff and quick service.${commentAddon} 10/10.`,
    `Really great spot! The ${primaryTopic}${serviceMention} was so good.${commentAddon} Will definitely be back.`,
    `Quick, friendly, and great quality. The ${primaryTopic} was spot on today!`,
    `Such a good experience at ${businessName}. Loved the ${primaryTopic} and chill vibe.${commentAddon}`,
    `Great little place! The ${primaryTopic} was delicious and the team is really sweet.${commentAddon}`,
    `Honestly so impressed with the ${primaryTopic} here.${serviceMention} Highly recommend!`,
    `Top quality ${primaryTopic} and fast service. Can't ask for much more!`,
    `Stopped by today and the ${primaryTopic} was amazing.${commentAddon} Definitely coming back.`,
  ];

  const naturalTemplates = [
    `Stopped by ${businessName} today and really loved it! The ${primaryTopic} was so good and the staff was super welcoming.${serviceMention}${commentAddon} Definitely making this my regular spot.`,
    `Honestly one of the best places around here. The ${primaryTopic} and ${secondaryTopic} were both spot on.${serviceMention}${commentAddon} Great vibe and quick service, 10/10!`,
    `Had a really nice time at ${businessName}. Everything was fresh and the team was super attentive.${commentAddon} You can tell they care about their ${primaryTopic}. Highly recommend!`,
    `Such a cozy spot! The ${primaryTopic} was fantastic and they have a great atmosphere.${serviceMention}${commentAddon} Will definitely be bringing friends here next time.`,
    `Really happy I checked out ${businessName}! The ${primaryTopic} exceeded expectations and the service was super fast.${commentAddon} Will be back for sure!`,
    `Dropped in this morning and loved everything about it. Great ${primaryTopic}, clean space, and very polite staff.${serviceMention}${commentAddon} Worth every penny.`,
    `Always a good experience coming here. The ${primaryTopic} is consistently great and the staff is always smiling.${commentAddon} Keep up the great work!`,
    `Came here on a friend's recommendation and it didn't disappoint! The ${primaryTopic} was incredible.${serviceMention}${commentAddon} Definitely recommend checking them out.`,
  ];

  const detailedTemplates = [
    `Dropped by ${businessName} today and was super impressed from start to finish. The ${primaryTopic} was fresh and full of flavor, and the ${secondaryTopic} was just as good.${serviceMention}${commentAddon} The staff was really friendly and made sure everything was taken care of. If you're anywhere in the area, definitely give this place a try!`,
    `Such a great find! Came in for a quick visit and ended up staying much longer because of the cozy vibe. The ${primaryTopic} was top tier and you can tell they take real pride in what they do.${serviceMention}${commentAddon} Clean space, fast service, and really nice people working here. Will 100% be returning soon.`,
    `Really can't say enough good things about ${businessName}. The ${primaryTopic} was outstanding and the ${secondaryTopic} was just as impressive.${serviceMention}${commentAddon} It's hard to find places with such consistent quality and friendly service these days. Easily a 5-star experience!`,
  ];

  if (tone === "short") {
    return shortTemplates[Math.floor(Math.random() * shortTemplates.length)];
  } else if (tone === "detailed") {
    return detailedTemplates[Math.floor(Math.random() * detailedTemplates.length)];
  }
  return naturalTemplates[Math.floor(Math.random() * naturalTemplates.length)];
}

// 4. Unified Generation Engine
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
