import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { COMPANY_ANALYSIS_PROMPT, BROKERAGE_ANALYSIS_PROMPT } from "../constants";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const analyzeVideo = async (videoUrl: string): Promise<string> => {
  const prompt = `
You are an expert financial analyst. Your task is to analyze the YouTube video at the provided URL using a two-tiered strategy.

**STRATEGY 1: FULL ANALYSIS (Primary)**
1.  **Search for Transcript:** Use your search tool to find a transcript or a very detailed summary of the video. The video may be in any language (e.g., Telugu), so search for transcripts in both English and the native language.
2.  **Translate if Needed:** If the content is not in English, you MUST translate it to English before analysis.
3.  **Generate Full Report:** If a transcript/detailed summary is found, generate a **"Full Analysis Report"**. This report MUST be based *only* on the video's content and follow this structure exactly:

    # [Video Title]
    - **Channel:** [Channel Name]
    - **Language:** [Detected Language]
    
    ### Video Summary
    [Concise recap of the video's main points.]
    
    ### Stocks and Sectors Referenced
    [A markdown table with columns: 'Stock/Sector', 'Sense (Core Driver)', 'Recommended Action', 'Contrarian View']
    
    ### Retail Investor Action Points
    [A checklist of practical, risk-managed next steps based on the video.]

---

**STRATEGY 2: PRELIMINARY ANALYSIS (Fallback)**
*   **Execute this ONLY IF you cannot find a transcript or detailed summary after a thorough search.**
*   In this case, generate a **"Preliminary Analysis Report"** based on the video's **title, description, and a summary of public comments**.
*   This preliminary report MUST use the following structure:

    # [Video Title]
    - **Channel:** [Channel Name]
    - **Language:** [Detected Language]

    > **Disclaimer:** A full transcript was not available. This is a preliminary analysis based on the video's title, description, and public comments.

    ### Topic Summary
    [Based on the title and description, what is this video likely about?]

    ### Public Comment Sentiment
    [Summarize the general sentiment and key themes from the comments section. Are viewers bullish, bearish, or asking specific questions?]

    ### Potential Stocks Mentioned
    [List any stocks or tickers mentioned in the title, description, or frequently in the comments.]

---

**FINAL INSTRUCTION:**
Your final output should be ONE of the two report types above. Do not mention that you failed; provide the best analysis possible with the available information.

Analyze the video at this URL: ${videoUrl}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    
    return response.text;
  } catch (error) {
    console.error("Full error object during video analysis:", error);
    throw new Error("Failed to analyze the video. The model may have been unable to access the content, or the URL is invalid/private. Please try a different URL.");
  }
};

export const analyzeCompanyStream = async (companyName: string): Promise<AsyncGenerator<GenerateContentResponse>> => {
    const prompt = COMPANY_ANALYSIS_PROMPT.replace(/\[\$Company Name\$\]/g, companyName);

    try {
        const stream = await ai.models.generateContentStream({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                thinkingConfig: { thinkingBudget: 32768 },
            },
        });
        return stream;
    } catch (error) {
        console.error("Error analyzing company:", error);
        throw new Error("Failed to start company analysis stream.");
    }
};

export const analyzeBrokerageReportsStream = async (): Promise<AsyncGenerator<GenerateContentResponse>> => {
    try {
        const stream = await ai.models.generateContentStream({
            model: 'gemini-2.5-pro',
            contents: BROKERAGE_ANALYSIS_PROMPT,
            config: {
                tools: [{ googleSearch: {} }],
                thinkingConfig: { thinkingBudget: 32768 },
            },
        });
        return stream;
    } catch (error) {
        console.error("Error analyzing brokerage reports:", error);
        throw new Error("Failed to start brokerage reports analysis stream.");
    }
};


export const getChatInstance = (): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'You are a helpful AI assistant specializing in financial markets and stock analysis. You can access real-time data from Google Search to provide up-to-date answers. Answer user questions concisely and accurately.',
            tools: [{ googleSearch: {} }],
        }
    });
};