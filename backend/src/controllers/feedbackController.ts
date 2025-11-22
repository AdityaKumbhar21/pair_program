import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const parseJsonResponse = (raw: string | undefined | null) => {
    if (!raw) {
        return null;
    }

    const trimmed = raw.trim();
    if (!trimmed) {
        return null;
    }

    const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fencedMatch && fencedMatch[1]) {
        const fencedContent = fencedMatch[1].trim();
        if (fencedContent) {
            try {
                return JSON.parse(fencedContent);
            } catch (error) {
                // fall through to try parsing the unfenced string below
            }
        }
    }

    try {
        return JSON.parse(trimmed);
    } catch (_error) {
        const firstBrace = trimmed.indexOf('{');
        const lastBrace = trimmed.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const candidate = trimmed.slice(firstBrace, lastBrace + 1);
            try {
                return JSON.parse(candidate);
            } catch (__error) {
                return null;
            }
        }
        return null;
    }
};

export const suugestFeedback = async (req: Request, res: Response) => {
    if (!genAI) {
        return res.status(500).json({
            ok: false,
            message: "Gemini API key is not configured."
        });
    }

    const { code } = req.body;

    if (!code) {
        return res.status(400).json({
            ok: false,
            message: "code is required."
        });
    }

    try {
        const prompt = `
You are an expert software engineer.

Analyze the following code strictly for:
1. Time Complexity (Big O)
2. Space Complexity (Big O)

Return the answer ONLY in valid JSON format as:
{
  "time_complexity": "...",
  "space_complexity": "..."
}

Code:
${code}
`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const rawText = response?.text?.() ?? response?.candidates?.[0]?.content?.parts?.map((part: any) => part.text).join("\n") ?? "";
        const parsed = parseJsonResponse(rawText);

        const feedback = {
            timeComplexity: parsed?.time_complexity ?? parsed?.timeComplexity ?? "Unable to determine",
            spaceComplexity: parsed?.space_complexity ?? parsed?.spaceComplexity ?? "Unable to determine",
            raw: rawText.trim()
        };

        return res.status(200).json({
            ok: true,
            message: "feedback generated successfully",
            feedback
        });
    } catch (error) {
        console.error("Feedback generation error:", error);
        return res.status(500).json({
            ok: false,
            message: "Failed to generate feedback"
        });
    }
};