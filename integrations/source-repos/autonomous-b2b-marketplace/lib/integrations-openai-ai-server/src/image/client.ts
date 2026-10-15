import Groq from "groq-sdk";

let groqInstance: Groq | null = null;

function getGroqClient(): Groq {
  if (groqInstance) return groqInstance;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is required but missing.");
  }
  groqInstance = new Groq({ apiKey });
  return groqInstance;
}

export const openai = new Proxy({}, {
  get(target, prop) {
    const client = getGroqClient();
    const value = (client as any)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
  set(target, prop, value) {
    const client = getGroqClient();
    (client as any)[prop] = value;
    return true;
  }
}) as Groq;

export async function generateImageBuffer(prompt: string): Promise<Buffer> {
  // Skeleton implementation for Groq compatibility
  throw new Error("Function needs implementation for Groq");
}

export async function editImages(prompt: string, images: Buffer[]): Promise<Buffer[]> {
  throw new Error("Function needs implementation for Groq");
}

