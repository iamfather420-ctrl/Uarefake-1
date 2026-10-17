import { Router, Request, Response } from "express";

const router = Router();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_SYSTEM_PROMPT = "You are the dAIsy haMINJA Sovereign AI Brain managing the 105 sovereign solutions, 54 active grid nodes, and deterministic paradox resolution pipeline.";

router.post("/groq", async (req: Request, res: Response) => {
  try {
    const { promptText, messages, temperature = 0.7, model = DEFAULT_MODEL } = req.body as {
      promptText?: string;
      messages?: Array<{ role: string; content: string }>;
      temperature?: number;
      model?: string;
    };

    const apiKey = process.env.GROQ_API_KEY;

    let payloadMessages: Array<{ role: string; content: string }> = [];

    if (messages && Array.isArray(messages) && messages.length > 0) {
      payloadMessages = messages;
    } else {
      payloadMessages = [
        { role: "system", content: DEFAULT_SYSTEM_PROMPT },
        { role: "user", content: promptText || "Request system status and 105 sovereign solutions summary." }
      ];
    }

    if (!apiKey) {
      // Fallback deterministic response when API key is unconfigured
      return res.json({
        content: `[dAIsy haMINJA Sovereign Core Local Fallback]\n\nModel: ${model} (Proxy Mode)\nStatus: 54-Node Grid Active | 105 Sovereign Solutions Synchronized\nNote: GROQ_API_KEY environment variable is not set. Operating under local deterministic U.A.R.E.F.A.K.E. protocol.`,
        model,
        fallback: true
      });
    }

    const groqResponse = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: payloadMessages,
        temperature
      })
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      req.log.error({ status: groqResponse.status, errorText }, "Groq API error response");
      return res.status(groqResponse.status).json({
        error: `Groq API Error (${groqResponse.status})`,
        details: errorText
      });
    }

    const data = await groqResponse.json() as {
      choices: Array<{ message: { content: string } }>;
      model: string;
      usage?: any;
    };

    const content = data.choices?.[0]?.message?.content ?? "";

    return res.json({
      content,
      model: data.model || model,
      usage: data.usage
    });
  } catch (err: any) {
    req.log.error({ err }, "Groq proxy route error");
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

export default router;
