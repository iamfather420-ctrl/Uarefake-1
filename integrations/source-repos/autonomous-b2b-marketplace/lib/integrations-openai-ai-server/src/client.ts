import OpenAI from "openai";
import Groq from "groq-sdk";
import { GoogleGenAI, Modality } from "@google/genai";

class GeminiOpenAIFallback {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  get chat() {
    return {
      completions: {
        create: async (params: any) => {
          const modelName = "gemini-3.5-flash";

          // If gpt-audio or modalities includes audio, use gemini tts
          if (params.model === "gpt-audio" || (params.modalities && params.modalities.includes("audio"))) {
            let textToSynthesize = "";
            for (const msg of params.messages) {
              if (msg.role === "user") {
                if (Array.isArray(msg.content)) {
                  textToSynthesize = "Hello Operator, SolveX Core is standing by.";
                } else {
                  textToSynthesize = msg.content;
                }
              }
            }

            textToSynthesize = textToSynthesize.replace("Repeat the following text verbatim: ", "");

            const response = await this.ai.models.generateContent({
              model: "gemini-3.1-flash-tts-preview",
              contents: [{ parts: [{ text: textToSynthesize }] }],
              config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Zephyr' },
                  },
                },
              },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";

            if (params.stream) {
              async function* mapTtsStream() {
                yield {
                  choices: [
                    {
                      delta: {
                        audio: {
                          data: base64Audio,
                          transcript: textToSynthesize
                        }
                      }
                    }
                  ]
                };
              }
              return mapTtsStream();
            }

            return {
              choices: [
                {
                  message: {
                    audio: {
                      data: base64Audio,
                      transcript: textToSynthesize
                    },
                    content: textToSynthesize
                  }
                }
              ]
            };
          }

          let systemInstruction = "";
          const contents: any[] = [];

          for (const msg of params.messages) {
            if (msg.role === "system") {
              systemInstruction = (systemInstruction ? systemInstruction + "\n" : "") + msg.content;
            } else {
              contents.push({
                role: msg.role === "assistant" ? "model" : "user",
                parts: [{ text: msg.content }]
              });
            }
          }

          if (params.stream) {
            const streamResponse = await this.ai.models.generateContentStream({
              model: modelName,
              contents,
              config: {
                systemInstruction,
              }
            });

            async function* mapStream() {
              for await (const chunk of streamResponse) {
                yield {
                  choices: [
                    {
                      delta: {
                        content: chunk.text || ""
                      }
                    }
                  ]
                };
              }
            }

            return mapStream();
          } else {
            const response = await this.ai.models.generateContent({
              model: modelName,
              contents,
              config: {
                systemInstruction,
              }
            });

            return {
              choices: [
                {
                  message: {
                    content: response.text || ""
                  }
                }
              ]
            };
          }
        }
      }
    };
  }

  get audio() {
    return {
      transcriptions: {
        create: async (params: any) => {
          let buffer: Buffer;
          if (params.file && typeof params.file.arrayBuffer === "function") {
            const ab = await params.file.arrayBuffer();
            buffer = Buffer.from(ab);
          } else if (params.file && params.file.buffer) {
            buffer = params.file.buffer;
          } else {
            buffer = Buffer.from("");
          }

          const base64AudioData = buffer.toString("base64");

          const response = await this.ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: [
              {
                inlineData: {
                  data: base64AudioData,
                  mimeType: "audio/wav"
                }
              },
              "Please transcribe this audio exactly, with no additional text, notes or formatting. If there is no audio, return an empty string."
            ]
          });

          const text = response.text?.trim() || "";

          if (params.stream) {
            async function* mapTranscribeStream() {
              yield {
                type: "transcript.text.delta",
                delta: text
              };
            }
            return mapTranscribeStream();
          }

          return {
            text
          };
        }
      }
    };
  }
}

class GroqOpenAIAdapter {
  private groq: Groq;

  constructor(apiKey: string) {
    this.groq = new Groq({ apiKey });
  }

  get chat() {
    return {
      completions: {
        create: async (params: any) => {
          const mappedParams = { ...params };
          // If the model is a placeholder, default, or OpenAI model, map to a strong Groq model
          if (mappedParams.model === "gpt-5.4" || mappedParams.model === "gpt-4o" || mappedParams.model === "gpt-3.5-turbo") {
            mappedParams.model = "llama-3.3-70b-versatile";
          }
          // Convert max_completion_tokens -> max_tokens for Groq
          if (mappedParams.max_completion_tokens !== undefined) {
            mappedParams.max_tokens = mappedParams.max_completion_tokens;
            delete mappedParams.max_completion_tokens;
          }
          return this.groq.chat.completions.create(mappedParams);
        }
      }
    };
  }

  get audio() {
    return {
      transcriptions: {
        create: async (params: any) => {
          const mappedParams = { ...params };
          if (mappedParams.model === "whisper-1" || !mappedParams.model) {
            mappedParams.model = "whisper-large-v3";
          }
          return this.groq.audio.transcriptions.create(mappedParams);
        }
      }
    };
  }
}

let clientInstance: any = null;

function getClient() {
  if (clientInstance) return clientInstance;

  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    clientInstance = new GroqOpenAIAdapter(groqKey);
    return clientInstance;
  }

  const openAiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  const openAiBaseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;

  if (openAiKey) {
    clientInstance = new OpenAI({
      apiKey: openAiKey,
      ...(openAiBaseUrl ? { baseURL: openAiBaseUrl } : {}),
    });
    return clientInstance;
  }

  // Fallback to Server-Side Gemini API
  console.warn("No OpenAI or Groq API key found in environment variables. Seamlessly falling back to server-side Gemini API...");
  clientInstance = new GeminiOpenAIFallback();
  return clientInstance;
}

// Export a proxy so any access to openai is forwarded to the lazy-initialized client
export const openai: any = new Proxy({}, {
  get(target, prop) {
    const client = getClient();
    const value = client[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
  set(target, prop, value) {
    const client = getClient();
    client[prop] = value;
    return true;
  }
});
