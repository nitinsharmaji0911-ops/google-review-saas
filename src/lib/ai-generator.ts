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

// Diverse Reviewer Styles & Personas to guarantee unique reviews every time
const REVIEW_PERSONAS = [
  {
    style: "Enthusiastic Discoverer",
    guidance: "Write from the perspective of a delighted customer discovering a gem. Focus on immediate positive impressions.",
    openers: ["First time visiting and genuinely impressed!", "Came here on a recommendation and it did not disappoint!", "What a wonderful spot!"]
  },
  {
    style: "Appreciative Regular / Seasoned Customer",
    guidance: "Write with familiar confidence. Highlight consistency, reliable quality, and great service.",
    openers: ["Always a pleasure coming here!", "Easily one of my favorite spots in town.", "Consistently great every single time."]
  },
  {
    style: "Detail & Quality Focused",
    guidance: "Focus directly on the quality of specific items, professionalism, precision, and value.",
    openers: ["The attention to detail here really stands out.", "Top-tier quality and wonderful attention to customer satisfaction.", "Everything was handled with utmost care and excellence."]
  },
  {
    style: "Vibe & Hospitality Lover",
    guidance: "Highlight the welcoming atmosphere, friendly staff, prompt service, and smooth experience.",
    openers: ["Super warm and welcoming staff from the moment you step in.", "Great ambience, friendly energy, and prompt service.", "Loved the vibe here!"]
  },
  {
    style: "Local Guide Recommendation",
    guidance: "Write as a local guide sharing a direct tip to others looking for the best in the area.",
    openers: ["If you're in the neighborhood, this is definitely worth a stop.", "Hands down one of the best choices for anyone looking for quality.", "Highly recommend checking this place out!"]
  },
  {
    style: "Clean & Punchy",
    guidance: "Keep it natural, direct, and conversational without fluff.",
    openers: ["Quick, professional, and excellent quality overall.", "Really solid experience from start to finish.", "Cannot say enough good things about the experience."]
  }
];

// 1. Google Gemini AI Generation with High Diversity
async function generateWithGemini(
  apiKey: string,
  params: GenerateReviewParams
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.95, // High variety
      topP: 0.95,
    }
  });

  const rating = params.rating || 5;
  const persona = REVIEW_PERSONAS[Math.floor(Math.random() * REVIEW_PERSONAS.length)];
  const suggestedOpener = persona.openers[Math.floor(Math.random() * persona.openers.length)];

  const toneInstructions = {
    short: "STRICT LENGTH: 1 to 2 short sentences. Max 18-25 words. Crisp and punchy.",
    natural: "STRICT LENGTH: 2 to 3 balanced sentences. Around 35-50 words. Natural and authentic.",
    detailed: "STRICT LENGTH: 4 to 5 descriptive sentences. Around 65-90 words. Thoughtful, specific, and detailed."
  }[params.tone || "natural"];

  const prompt = `You are a real, authentic human customer writing a Google review for "${params.businessName}" (${params.category}${params.location ? `, located in ${params.location}` : ""}).

Rating: ${rating} out of 5 Stars
Writing Persona: ${persona.style} (${persona.guidance})
Selected Highlights/Keywords: ${params.selectedTopics.length > 0 ? params.selectedTopics.join(", ") : "Quality, Service, Ambience"}
Selected Specific Items: ${params.selectedServices.length > 0 ? params.selectedServices.join(", ") : "None"}
Customer Note: ${params.customerComment ? `"${params.customerComment}"` : "None"}

CRITICAL RULES FOR DIVERSITY & HUMAN REALISM:
1. NEVER start with generic AI clichés like "I recently visited", "I had an amazing experience at", or "Great place".
2. You can use an opening style similar to: "${suggestedOpener}" or a fresh, authentic conversational opening.
3. Seamlessly weave in the selected highlights naturally so it sounds like real customer praise, not a list.
4. ${toneInstructions}
5. Write in natural FIRST PERSON ("I", "We").
6. End with an organic closing thought (e.g., "Will definitely be back!", "Highly recommended!", "10/10!", "Worth every penny!").
7. Output ONLY the raw review text without quotes or explanations.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  return text.replace(/^["']|["']$/g, "").trim();
}

// 2. Diverse Smart NLP Combinator (20+ Varied Template Combos)
export function generateSmartTemplateReview(params: GenerateReviewParams): string {
  const { businessName, selectedTopics, selectedServices, customerComment, tone = "natural" } = params;

  const topicsList = selectedTopics.length > 0 ? selectedTopics : ["overall quality", "great service"];
  const servicesList = selectedServices.length > 0 ? selectedServices : [];
  const primaryTopic = topicsList[0];
  const secondaryTopic = topicsList[1] || topicsList[0];
  const serviceMention = servicesList.length > 0 ? ` (${servicesList.join(", ")})` : "";
  const commentAddon = customerComment ? ` ${customerComment.trim()}.` : "";

  // Short templates (8 distinct variations)
  const shortTemplates = [
    `Super impressed with ${businessName}! The ${primaryTopic.toLowerCase()} was top-notch.${commentAddon} Highly recommend!`,
    `Really great experience here. Loved the ${primaryTopic.toLowerCase()}${serviceMention}.${commentAddon} 10/10!`,
    `Fantastic service and wonderful ${primaryTopic.toLowerCase()} at ${businessName}.${commentAddon} Will be back for sure.`,
    `Such a great spot! The ${primaryTopic.toLowerCase()} and ${secondaryTopic.toLowerCase()} exceeded my expectations.${commentAddon}`,
    `Quick, friendly, and top quality. The ${primaryTopic.toLowerCase()} was standout.${commentAddon}`,
    `Always a treat visiting ${businessName}. The ${primaryTopic.toLowerCase()} never disappoints!`,
    `Top-notch ${primaryTopic.toLowerCase()} and warm hospitality.${commentAddon} Definitely worth stopping by!`,
    `Loved everything about my visit, especially the ${primaryTopic.toLowerCase()}${serviceMention}.${commentAddon}`
  ];

  // Natural templates (8 distinct variations)
  const naturalTemplates = [
    `Had a wonderful time at ${businessName}. The ${primaryTopic.toLowerCase()} was absolutely outstanding and the team made the whole experience effortless.${serviceMention}${commentAddon} Highly recommend to anyone in the area!`,
    `First time trying ${businessName} and I am genuinely impressed. The attention to ${primaryTopic.toLowerCase()} and ${secondaryTopic.toLowerCase()} really sets them apart.${commentAddon} Will definitely be returning soon!`,
    `Cannot say enough good things about ${businessName}. Everything from the ${primaryTopic.toLowerCase()} to the welcoming atmosphere was spot on.${serviceMention}${commentAddon} A solid 5-star experience!`,
    `Consistently stellar quality every time I visit. The ${primaryTopic.toLowerCase()} was exceptional today.${commentAddon} The staff is always courteous and attentive.`,
    `What a great find! The ${primaryTopic.toLowerCase()} and ${secondaryTopic.toLowerCase()} were both fantastic.${serviceMention}${commentAddon} Easily one of the best places in town for this.`,
    `Really appreciated the prompt service and great attention to detail at ${businessName}. The ${primaryTopic.toLowerCase()} made all the difference.${commentAddon} Keep up the great work!`,
    `Came in today and left completely satisfied. The ${primaryTopic.toLowerCase()} was top tier, and the staff was super helpful.${commentAddon} Will certainly recommend to friends and family.`,
    `A standout experience at ${businessName}! From the ${primaryTopic.toLowerCase()} to the overall ambience, everything was top notch.${serviceMention}${commentAddon} 10/10 recommendation!`
  ];

  // Detailed templates (6 distinct variations)
  const detailedTemplates = [
    `I recently had the opportunity to visit ${businessName}, and it exceeded every expectation. The focus on ${primaryTopic.toLowerCase()} was evident from start to finish, and the ${secondaryTopic.toLowerCase()} made the entire visit memorable.${serviceMention}${commentAddon} The staff was attentive, professional, and welcoming. If you're looking for genuine quality and dependable service, this is hands down the place to go!`,
    `From the moment you walk into ${businessName}, you can tell they take pride in what they do. The ${primaryTopic.toLowerCase()} was executed to perfection, and the staff was extremely courteous throughout.${serviceMention}${commentAddon} It is rare to find a business that combines great service, pristine standards, and top-tier ${secondaryTopic.toLowerCase()} so effortlessly. Will definitely be a regular here!`,
    `An exceptional experience all around at ${businessName}. Everything we tried was fresh, well-prepared, and delivered with genuine care.${serviceMention} The ${primaryTopic.toLowerCase()} was a standout highlight, and the ${secondaryTopic.toLowerCase()} was equally impressive.${commentAddon} It's easily one of the best spots in the area and I couldn't be happier with the visit. Highly recommended!`,
    `Had such a pleasant experience at ${businessName} today! The team was super accommodating, and the ${primaryTopic.toLowerCase()} was truly phenomenal.${serviceMention}${commentAddon} You can tell a lot of passion and expertise goes into their work. If you value great quality and attentive service, do not hesitate to check them out. Will definitely be back again soon!`
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
