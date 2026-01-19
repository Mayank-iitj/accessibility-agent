import Groq from "groq-sdk";

const API_KEY = process.env.GROQ_API_KEY || "";
const groq = new Groq({ apiKey: API_KEY });

// Using Llama 3.2 90B Vision for high-reasoning multimodal capabilities
const MODEL_NAME = "llama-3.3-70b-versatile"; // Current stable Groq flagship

export async function analyzeContent(content: string, type: 'text' | 'image' | 'pdf', imageData?: string) {
    // 1. Check for API Key Availability
    if (!API_KEY) {
        console.warn("No GROQ_API_KEY found. Defaulting to Demo Mode.");
        return getMockResponse();
    }

    let messages: any[] = [];

    // Construct Message Payload for Groq (OpenAI Compatible)
    if (type === 'image' && imageData) {
        messages = [
            {
                role: "user",
                content: [
                    { type: "text", text: getSystemPrompt(content) },
                    {
                        type: "image_url",
                        image_url: {
                            url: imageData // Expecting data:image/png;base64,... 
                        }
                    }
                ]
            }
        ];
    } else {
        messages = [
            {
                role: "user",
                content: getSystemPrompt(content)
            }
        ];
    }

    try {
        const completion = await groq.chat.completions.create({
            messages: messages,
            model: MODEL_NAME,
            temperature: 0.1, // Low temp for strict reasoning
            response_format: { type: "json_object" }, // Enforce JSON
            stream: false,
        });

        const contentResponse = completion.choices[0]?.message?.content || "{}";
        console.log("[DEBUG] Raw API Response:", contentResponse);

        try {
            return JSON.parse(contentResponse);
        } catch (parseError) {
            console.error("[ERROR] JSON Parse Failed:", parseError);
            console.error("[ERROR] Content was:", contentResponse);
            return getMockResponse();
        }

    } catch (error) {
        console.error("Groq Analysis Failed:", error);
        if (error instanceof Error) {
            console.error("Error details:", error.message, error.stack);
        }
        return getMockResponse();
    }
}

function getSystemPrompt(content: string) {
    return `
    You are Reason3, a sophisticated claim-reasoning engine. 
    Your goal is to analyze the provided input and perform a deep verification.
    
    You must NOT summarize. You must NOT chat. You must reasoning strictly.
    
    INPUT CONTENT:
    ${content}
    
    ---
    
    PERFORM THE FOLLOWING STEPS:
    
    1. **Claim Extraction**: Identify the core claims. Separate facts, opinions, and predictions.
    2. **Logical & Statistical Analysis**: Look for specific issues like correlation vs causation, missing baselines, cherry-picking, or truncated axes (if chart).
    3. **Verdict**: Assign one of: "Well-Supported" (✅), "Partially Supported" (⚠️), "Misleading" (❌), or "Insufficient Information" (❓).
    4. **Explanation**: Generate a neutral, educational explanation.
    5. **"What would make this true?"**: Propose data or framing that would validate the claim.
    
    RETURN JSON ONLY. 
    
    Expected Format:
    {
      "analysis_target": "Brief title of what was analyzed",
      "claims": [
        {
          "claim_id": "C1",
          "claim_text": "The exact claim text",
          "claim_type": "factual | statistical | causal | predictive",
          "verdict": "Well-Supported" | "Partially Supported" | "Misleading" | "Insufficient Information",
          "confidence_score": 0-100,
          "logical_issues": ["Issue 1", "Issue 2"],
          "statistical_issues": ["Issue 1"],
          "explanation": "Clear, neutral explanation...",
          "what_would_make_this_true": "Actionable advice on data/framing...",
          "evidence_present": boolean
        }
      ],
      "overall_risk_score": 0-100,
      "summary_insight": "A 1-sentence high level summary"
    }
  `;
}

function getMockResponse() {
    return {
        analysis_target: "Analysis Failed (Fallback Mode)",
        claims: [
            {
                claim_id: "ERR-1",
                claim_text: "The system could not complete the live analysis.",
                claim_type: "factual",
                verdict: "Insufficient Information",
                confidence_score: 0,
                logical_issues: ["API Error"],
                statistical_issues: [],
                explanation: "An error occurred while connecting to the engine. High traffic or network issues may be the cause.",
                what_would_make_this_true: "Check your network connection and API key limits.",
                evidence_present: false
            }
        ],
        overall_risk_score: 0,
        summary_insight: "Analysis Temporarily Unavailable"
    };
}
