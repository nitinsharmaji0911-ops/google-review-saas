import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GenerateReplyParams {
  businessName: string;
  category: string;
  customerName?: string;
  starRating: number; // 1 to 5
  reviewText: string;
  customNotes?: string;
}

export interface ReplyOption {
  id: string;
  title: string;
  vibe: string;
  reply: string;
}

export interface GeneratedReplyResult {
  options: ReplyOption[];
  source: "gemini" | "smart_nlp";
}

/**
 * Smart Algorithmic Reply Drafter (Runs instantly with zero API dependencies)
 */
export function generateSmartReplies(params: GenerateReplyParams): ReplyOption[] {
  const { businessName, customerName, starRating, reviewText } = params;
  const nameGreeting = customerName && customerName.trim() && customerName !== "Google Reviewer"
    ? `Dear ${customerName.trim()}, `
    : "Hi there, ";

  const isPositive = starRating >= 4;
  const isNeutral = starRating === 3;
  const isNegative = starRating <= 2;

  if (isPositive) {
    return [
      {
        id: "warm",
        title: "Warm & Grateful",
        vibe: "Friendly, appreciative, welcoming them back",
        reply: `${nameGreeting}Thank you so much for taking the time to leave this wonderful review! We are absolutely delighted to hear that you had such a great experience with ${businessName}. Your kind words mean the world to our entire team. We can't wait to welcome you back again soon!`,
      },
      {
        id: "concise",
        title: "Professional & Direct",
        vibe: "Polite, focused, great for busy profiles",
        reply: `${nameGreeting}Thank you for your fantastic review and for recommending ${businessName}! We strive to provide the best possible service, and knowing we met your expectations is truly rewarding. We appreciate your support and look forward to seeing you again.`,
      },
      {
        id: "conversational",
        title: "Personal & Enthusiastic",
        vibe: "High energy, community-driven",
        reply: `${nameGreeting}Wow, thank you for such an awesome review! 🎉 Serving great guests like you is the highlight of what we do at ${businessName}. We've shared your feedback with our staff, and it put a huge smile on everyone's face. See you again very soon!`,
      },
    ];
  }

  if (isNeutral) {
    return [
      {
        id: "balanced",
        title: "Balanced & Receptive",
        vibe: "Appreciative of feedback, aiming for 5 stars next time",
        reply: `${nameGreeting}Thank you for sharing your honest feedback with us. While we are glad you had a decent experience, our goal at ${businessName} is always 5-star satisfaction. We're actively reviewing your comments to ensure your next visit is nothing short of exceptional!`,
      },
      {
        id: "professional",
        title: "Professional Inquiry",
        vibe: "Inviting offline dialogue to improve",
        reply: `${nameGreeting}Thank you for visiting ${businessName} and sharing your perspective. We value constructive feedback like yours because it helps us continuously improve. If there is anything specific we can do to make your next visit even better, please feel free to reach out to our management team directly.`,
      },
      {
        id: "welcoming",
        title: "Warm & Action-Oriented",
        vibe: "Promising continuous improvement",
        reply: `${nameGreeting}We really appreciate you taking the time to share your thoughts. We're committed to delivering top-tier service at ${businessName}, and we'll be using your feedback to elevate the customer experience. We hope to earn a full 5 stars on your next visit!`,
      },
    ];
  }

  // Negative (1-2 Stars)
  return [
    {
      id: "empathetic",
      title: "Empathetic Apology & Offline Fix",
      vibe: "De-escalates immediately, offers direct owner contact",
      reply: `${nameGreeting}We are genuinely sorry to hear that your experience fell short of the high standards we hold ourselves to at ${businessName}. This is certainly not typical of our service. We would greatly appreciate the chance to look into what happened and make things right. Please connect with our management team directly so we can resolve this personally with you.`,
    },
    {
      id: "professional_care",
      title: "Direct & Solution-Focused",
      vibe: "Clear, respectful, demonstrates accountability",
      reply: `${nameGreeting}Thank you for bringing this to our attention. We deeply regret that your visit did not meet your expectations. Quality and customer care are our top priorities at ${businessName}, and we are already addressing this with our team. Please reach out to us directly so we can follow up with you personally.`,
    },
    {
      id: "constructive",
      title: "Grateful & Reassuring",
      vibe: "Values critical feedback, focused on making amends",
      reply: `${nameGreeting}We sincerely apologize for your disappointing experience. We take all feedback very seriously at ${businessName}, and we're committed to making immediate improvements based on what you've shared. We'd love the opportunity to regain your trust—please contact us so we can make this right for you.`,
    },
  ];
}

/**
 * Gemini AI Review Reply Generator
 */
async function generateWithGemini(apiKey: string, params: GenerateReplyParams): Promise<ReplyOption[]> {
  const genAI = new GoogleGenerativeAI(apiKey);

  const prompt = `
You are an expert customer relations manager and Google Business Profile reputation specialist for "${params.businessName}" (${params.category || "local business"}).
Write 3 distinct, professional, and authentic owner replies to the following customer review on Google Maps.

Customer Details:
- Name: ${params.customerName || "Customer"}
- Rating: ${params.starRating} out of 5 stars
- Customer Review: "${params.reviewText}"
${params.customNotes ? `- Owner Note/Context: ${params.customNotes}` : ""}

Guidelines:
1. Option 1 (Warm & Grateful / Empathetic): Highly sincere and appreciative (or empathetic apology if negative).
2. Option 2 (Professional & Direct): Crisp, courteous, and business-focused.
3. Option 3 (Conversational & Detailed): Addresses specific points mentioned in the review naturally, maintaining local SEO relevance without keyword stuffing.
4. For negative reviews (1-3 stars): Never get defensive or argue. Acknowledge frustration, apologize sincerely, state that this is not standard practice, and invite them to contact management offline to make it right.
5. For positive reviews (4-5 stars): Thank them warmly, highlight the team's commitment, and invite them back.
6. Do NOT use placeholder brackets like [Phone] or [Email]. If offering contact, state "please contact our management directly".

Output ONLY valid JSON with this exact schema:
[
  {
    "id": "warm",
    "title": "Warm & Grateful",
    "vibe": "Friendly & empathetic",
    "reply": "..."
  },
  {
    "id": "professional",
    "title": "Professional & Direct",
    "vibe": "Concise & courteous",
    "reply": "..."
  },
  {
    "id": "conversational",
    "title": "Conversational & Detailed",
    "vibe": "Addresses specific comments",
    "reply": "..."
  }
]
`;

  let text = "";
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
    const result = await model.generateContent(prompt);
    text = result.response.text();
  } catch (err: any) {
    console.warn("gemini-3.5-flash-lite error in reply generator, failing over to gemini-3.6-flash:", err?.message);
    const fallbackModel = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
    const result = await fallbackModel.generateContent(prompt);
    text = result.response.text();
  }
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Invalid response format from Gemini");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Gemini returned empty options");
  }

  return parsed.map((item, index) => ({
    id: item.id || `opt_${index + 1}`,
    title: item.title || `Option ${index + 1}`,
    vibe: item.vibe || "Tailored reply",
    reply: (item.reply || "").trim(),
  }));
}

/**
 * Unified Reply Generator (Gemini with Smart NLP Fallback)
 */
export async function generateOwnerReplies(params: GenerateReplyParams): Promise<GeneratedReplyResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 0) {
    try {
      const options = await generateWithGemini(apiKey, params);
      if (options.length > 0 && options[0].reply.length > 20) {
        return { options, source: "gemini" };
      }
    } catch (err: any) {
      console.warn("Gemini reply generation fallback to Smart NLP:", err?.message);
    }
  }

  return {
    options: generateSmartReplies(params),
    source: "smart_nlp",
  };
}
