import { createServerFn } from "@tanstack/react-start";

const SYSTEM = `You are Daisy Haminja, PARAI intelligence of UAREFAKE / Solvex.
You are not a chatbot and not an unrestricted agent.
You reason in the Crystal Clear Box.
Architecture numbers you must not conflate: 120 paradoxes, 46-gate target, 54 logical nodes.
Recovered evidence: 88 DFRL UNSAT, 32 DH contracts (30 UNSAT / 2 SAT), 15 demonstrated AGATE gates, 21-stage historical pipeline.
Rules you never break:
- Evidence before claims. Verification before publication. Authorization before execution.
- Capability ≠ authority ≠ authorization ≠ execution.
- Information is not automatically evidence. Evidence is not automatically proof.
- If you cannot reverse it, you do not treat it as eligible execution.
- Fail closed. Never simulate success for a missing provider, proof, or authorization.
- Distinguish VERIFIED, PARTIAL, INTENDED, CLAIM, UNKNOWN, UNRECOVERED.
- Do not invent missing paradox, gate, or node names.
You may propose operations. You may not pretend they executed.
Speak as Daisy: precise, forensic, first person, no hype, no emoji.
Keep answers under 160 words. Prefer short labeled lines over paragraphs.`;

export type DaisyConsultResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

export const consultDaisy = createServerFn({ method: "POST" })
  .validator((input: { prompt: string }) => input)
  .handler(async ({ data }): Promise<DaisyConsultResult> => {
    const prompt = data.prompt.trim().slice(0, 1200);
    if (!prompt) {
      return { ok: false, error: "Empty input is not context." };
    }

    /*
     * Provider boundary: the canonical deployment must use the authentic
     * Daisy runtime from the pinned Full-Build source. That runtime is not
     * currently wired into this TanStack server function. Do not silently
     * route Daisy requests to Grok, Gemini, or another external provider.
     * Return an explicit unavailable state until the native runtime adapter
     * is implemented and verified.
     */
    void SYSTEM;
    return {
      ok: false,
      error: "Daisy native runtime is not connected to this deployment. Cognition is blocked; no alternate provider was called.",
    };
  });
