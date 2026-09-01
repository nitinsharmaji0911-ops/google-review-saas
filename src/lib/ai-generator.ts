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

// 1. Google Gemini AI Generation
async function generateWithGemini(
  apiKey: string,
  params: GenerateReviewParams
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const rating = params.rating || 5;

  const sentimentInstructions = {
    5: "SENTIMENT: Warm, enthusiastic, highly appreciative 5-star review praising the experience.",
    4: "SENTIMENT: Friendly, positive review praising the visit, staff, and quality.",
    3: "SENTIMENT: Helpful, polite, and positive review highlighting the good service.",
    2: "SENTIMENT: Polite, supportive review highlighting the positive aspects and strengths.",
    1: "SENTIMENT: Constructive, friendly review highlighting the business strengths.",
  }[rating] || "SENTIMENT: Warm, polite, highly appreciative review.";

  const toneInstructions = {
    short: "STRICT LENGTH: Maximum 1 to 2 short sentences. Under 20 words total. Clean and polite.",
    natural: "STRICT LENGTH: 2 to 3 balanced sentences. Around 35-45 words. Polite and natural.",
    detailed: "STRICT LENGTH: 4 to 5 descriptive sentences. Around 65-85 words. Thoughtful, polite, and detailed."
  }[params.tone || "natural"];

  const prompt = `You are a polite, respectful customer writing a Google review for "${params.businessName}" (${params.category}${params.location ? `, located in ${params.location}` : ""}).

Customer Rating: ${rating} out of 5 Stars
${sentimentInstructions}

Selected Aspects/Issues: ${params.selectedTopics.length > 0 ? params.selectedTopics.join(", ") : "General experience"}
Selected Items: ${params.selectedServices.length > 0 ? params.selectedServices.join(", ") : "None"}
Customer Note: ${params.customerComment ? `"${params.customerComment}"` : "None"}

CRITICAL RULES:
1. ALWAYS maintain a POLITE, CIVIL, and RESPECTFUL tone, even for 1-star or 2-star ratings.
2. Avoid harsh, dramatic, or aggressive words. Frame criticisms constructively (e.g. "Unfortunately, my experience fell short due to...", "I hope the team can look into...").
3. ${sentimentInstructions}
4. ${toneInstructions}
5. Write in natural FIRST PERSON ("I", "We").
6. Output ONLY the raw review text without quotes.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  return text.replace(/^["']|["']$/g, "").trim();
}

// 2. Smart NLP Combinator (Polite & Constructive Engine)
export function generateSmartTemplateReview(params: GenerateReviewParams): string {
  const { businessName, selectedTopics, selectedServices, customerComment, tone = "natural", rating = 5 } = params;

  // Polite Negative / 1-2 Star Reviews
  if (rating <= 2) {
    const issues = selectedTopics.length > 0 ? selectedTopics.join(" and ").toLowerCase() : "the overall experience";
    const commentAddon = customerComment ? ` ${customerComment.trim()}.` : "";

    if (rating === 1) {
      if (tone === "short") {
        return `Unfortunately, my visit to ${businessName} fell short regarding ${issues}.${commentAddon} Hoping for improvement.`;
      }
      return `I was looking forward to visiting ${businessName}, but unfortunately the ${issues} did not meet expectations today.${commentAddon} I hope management takes this feedback constructively to improve for future guests.`;
    } else {
      // 2 stars
      if (tone === "short") {
        return `A disappointing visit to ${businessName}. The ${issues} could be improved.`;
      }
      return `Had a rather underwhelming experience at ${businessName}. While I appreciate the team's effort, the ${issues} was not up to standard today.${commentAddon} Hoping to see better service next time.`;
    }
  }

  // Polite 3 Star Reviews
  if (rating === 3) {
    const topicsPart = selectedTopics.length > 0 ? selectedTopics.join(" and ").toLowerCase() : "the visit";
    const commentAddon = customerComment ? ` ${customerComment.trim()}.` : "";
    if (tone === "short") {
      return `An average visit to ${businessName}. The ${topicsPart} was decent, but there is room for improvement.`;
    }
    return `A decent experience at ${businessName}. While certain aspects were fine, the ${topicsPart} could definitely be improved.${commentAddon} A fair 3-star experience overall.`;
  }

  // Polite Positive 4-5 Star Reviews
  if (tone === "short") {
    const shortPraises = selectedTopics.length > 0
      ? `The ${selectedTopics.slice(0, 2).join(" and ").toLowerCase()} was wonderful.`
      : `Everything was very pleasant.`;
    return `Really enjoyed my visit to ${businessName}! ${shortPraises} Thank you to the team.`;
  }

  if (tone === "detailed") {
    let itemsPart = selectedServices.length > 0
      ? `I particularly appreciated the ${selectedServices.join(" and ")}, which was prepared wonderfully.`
      : `The attention to quality throughout my visit was evident.`;
    let topicsPart = selectedTopics.length > 0
      ? `Special thanks for the wonderful ${selectedTopics.join(", ").toLowerCase()} — it made my visit truly memorable.`
      : `The staff was warm and attentive throughout.`;
    let commentPart = customerComment ? ` ${customerComment.trim()}.` : "";
    return `I had a truly delightful experience visiting ${businessName}. ${itemsPart} ${topicsPart}${commentPart} Thank you to the team for the great hospitality, I will gladly return!`;
  }

  // 4-5 Stars Natural / Balanced
  let body = "";
  if (selectedServices.length > 0 && selectedTopics.length > 0) {
    body = `The ${selectedServices.join(" and ")} was lovely, and the ${selectedTopics.join(" and ").toLowerCase()} really made the visit enjoyable.`;
  } else if (selectedTopics.length > 0) {
    body = `The ${selectedTopics.join(" and ").toLowerCase()} was very pleasant and well managed.`;
  } else {
    body = `The service was polite, the staff was attentive, and the atmosphere was great.`;
  }
  let commentAddon = customerComment ? ` ${customerComment.trim()}.` : "";
  return `Had a wonderful experience at ${businessName}! ${body}${commentAddon} Thank you for the great service.`;
}

// Master Generator orchestrator
export async function generateReview(params: GenerateReviewParams): Promise<GeneratedReviewResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 5) {
    try {
      const review = await generateWithGemini(apiKey, params);
      if (review && review.length > 10) {
        return { review, source: "gemini" };
      }
    } catch (err) {
      console.warn("Gemini API call failed, using Smart NLP fallback:", err);
    }
  }

  const review = generateSmartTemplateReview(params);
  return { review, source: "smart_nlp" };
}
