import { GoogleGenAI } from '@google/genai';
import { VaultService } from './VaultService';

const isKeyPlaceholder = (key?: string) => !key || key === 'MY_GEMINI_API_KEY' || key.toLowerCase().includes('placeholder') || key === 'undefined' || key === 'null';
const systemKey = process.env.GEMINI_API_KEY;

export interface AIAuditResult {
  confidence: number;
  suggestion: 'verified' | 'rejected' | 'pending';
  reasoning: string;
}

export class GeminiService {
  constructor() {}

  private getClient(): { ai: GoogleGenAI; hasKey: boolean } {
    const manualKey = VaultService.getSecret('gemini_api_key') || localStorage.getItem('warhive_manual_ai_key') || '';
    const geminiKey = isKeyPlaceholder(systemKey) ? manualKey : systemKey;
    const hasKey = !isKeyPlaceholder(geminiKey);
    return {
      ai: new GoogleGenAI({ apiKey: isKeyPlaceholder(geminiKey) ? 'AI_STUDIO_KEY_REQUIRED' : geminiKey! }),
      hasKey
    };
  }

  isConfigured(): boolean {
    return this.getClient().hasKey;
  }

  async auditLead(target: string, type: string, evidence: string): Promise<AIAuditResult> {
    const { ai, hasKey } = this.getClient();
    if (!hasKey) {
      return { confidence: 0.5, suggestion: 'pending', reasoning: 'AI Auditor offline (API Key required)' };
    }

    try {
      const result = await (ai as any).models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Perform a high-fidelity cryptographic audit and fraud detection analysis on the following blockchain discovery lead.
        
        Target Entity: ${target}
        Violation Category: ${type}
        Evidence Provided: ${evidence}

        Analyze if this represents "Systemic Waste" (orphaned assets, unlicensed operators, MEV opportunities) that can be reclaimed via autonomous protocols.
        
        Output strictly in JSON format:
        {
          "confidence": (number 0.0 to 1.0),
          "suggestion": ("verified" or "rejected"),
          "reasoning": "Technical justification for the decision"
        }`,
        config: { responseMimeType: "application/json" }
      });

      const response = await result.response;
      const text = response.text();
      const cleanJson = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error('Gemini Audit Error:', error);
      return { confidence: 0.5, suggestion: 'pending', reasoning: 'Heuristic engine timeout during analysis.' };
    }
  }

  async analyzeDiscovery(discoveryData: any, target: string): Promise<string[]> {
    const { ai, hasKey } = this.getClient();
    if (!hasKey) return ['Heuristic analysis restricted: Provide API Key.'];

    try {
      const result = await (ai as any).models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this blockchain discovery and provide 4 technical insights for a systemic waste recovery application. 
        Focus on settlement risks and protocol compatibility on Solana. 
        Discovery Data: ${JSON.stringify(discoveryData)}
        Target: ${target}
        
        Output as a JSON array of strings only.`,
        config: { responseMimeType: "application/json" }
      });

      const response = await result.response;
      const text = response.text();
      const cleanJson = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error('Gemini Discovery Analysis Error:', error);
      return ['Audit Kernel busy. Reverting to local heuristic matching.'];
    }
  }
}

export const geminiService = new GeminiService();
