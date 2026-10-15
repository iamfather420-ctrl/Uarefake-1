import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Initialize the Google GenAI SDK on the server
// Use process.env.GEMINI_API_KEY injected automatically by AI Studio
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({
  apiKey: apiKey,
});

// API endpoint for Quantum AI real-time optimization insights
app.post("/api/optimize", async (req, res) => {
  try {
    const {
      taskType,
      parameters,
      quantumNodesCount,
      neuralSearchIntensity,
      simulatedMetrics,
    } = req.body;

    if (!apiKey) {
      // Graceful error if key is missing
      return res.status(200).json({
        success: false,
        error: "GEMINI_API_KEY is not configured in the AI Studio environment. Please set it in the Secrets panel.",
        insights: {
          theoreticalFormula: "H_{QC} = \\sum_{i} h_i \\sigma_i^z + \\sum_{i < j} J_{ij} \\sigma_i^z \\sigma_j^z + \\alpha \\mathcal{L}_{NAS}(\\theta)",
          nasArchitectureSummary: "Quantum-Classical Hybrid Transformer: 16 variational quantum circuit layers coupled with a multi-head spatial self-attention manifold. Optimized via a hardware-aware policy gradient algorithm.",
          quantumNodeAnalysis: `Distributed processing across ${quantumNodesCount || 16} simulated nodes completed successfully. Superposition states remained stable with an estimated coherence of ${simulatedMetrics?.qubitCoherencePct || 94.5}%. Entanglement topology was modeled as a dynamic 2D grid matrix.`,
          optimizationInsight: `Demonstrated a simulated ${simulatedMetrics?.efficiencyGainPct || 35.8}% reduction in compute path latency. Under severe multi-dimensional constraints, the quantum-inspired system found an optimum route layout satisfying all boundary constraints within ${simulatedMetrics?.computationTimeQuantumMs || 42}ms compared to the classical benchmark of ${simulatedMetrics?.computationTimeClassicalMs || 380}ms.`,
          suggestedBlueprintPrompt: `Futuristic engineering CAD schematic blueprint of a quantum computing circuit and neural architecture layout, featuring circular superconducting qubit loops, glowing neon laser routing vectors, quantum gate nodes, complex data buses, microchip traces, and spatial graph grids, technical blueprints style, deep navy background with glowing cyan and electric purple accents, highly detailed diagrams, orthographic technical render.`
        }
      });
    }

    // Call Gemini 3.5 Flash for advanced analytical insight on the simulation
    const prompt = `
      You are the Quantum AI Optimization Oracle. Analyze the following real-time optimization task and provide high-level theoretical, mathematical, and practical insights.

      Task Configuration:
      - Domain: ${taskType === "logistics" ? "Global Supply Chain & Logistics Routing" : "High-Frequency Portfolio & Financial Asset Modeling"}
      - Distributed Quantum Nodes: ${quantumNodesCount} nodes simulating quantum superposition and entanglement.
      - Neural Architecture Search (NAS) Intensity: ${neuralSearchIntensity} (Neural network layers optimized for the quantum hardware topological layout).
      - Core Parameters: ${JSON.stringify(parameters)}
      - Simulated Run Results: ${JSON.stringify(simulatedMetrics)}

      Please return a highly detailed, professional analysis structured in JSON format matching this exact schema:
      {
        "theoreticalFormula": "A LaTeX style mathematical formulation of the quantum-classical hybrid cost function solved by this setup (e.g., Ising model Hamiltonian + neural loss multiplier)",
        "nasArchitectureSummary": "A concise description of the searched neural network architecture tailored for this quantum layout (e.g. quantum-inspired transformer grid with variational circuit layers)",
        "quantumNodeAnalysis": "An analysis of how the distributed quantum processing nodes handle superposition and scale bottlenecks for this task size",
        "optimizationInsight": "A practical takeaway on how this hybrid solution solves the logistics path/portfolio optimization, citing simulated efficiency improvements and stability under noise",
        "suggestedBlueprintPrompt": "A highly descriptive, cool sci-fi schematic/blueprint image prompt (80-120 words) detailing a quantum circuit layout, neural network spatial layers, and data flows. It must specify a technical grid, fine CAD lines, deep blue/neon aesthetics, and circuit traces."
      }

      Ensure you ONLY return valid JSON. Do not include markdown code block characters like \`\`\`json.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const insights = JSON.parse(cleanedText);

    res.json({ success: true, insights });
  } catch (error: any) {
    console.error("Optimization error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to generate optimization insights" });
  }
});

// API endpoint for Generating Blueprint Images
app.post("/api/generate-blueprint", async (req, res) => {
  try {
    const { prompt, aspectRatio, imageSize, quality } = req.body;

    if (!apiKey) {
      return res.status(200).json({
        success: false,
        error: "GEMINI_API_KEY is not configured in the AI Studio environment. Please set it in the Secrets panel to activate actual image generation.",
        imageUrl: null,
      });
    }

    // Decide which model to use:
    // - gemini-3-pro-image-preview for studio quality / pro requirements
    // - gemini-3.1-flash-image-preview for general cases
    const model = quality === "studio" ? "gemini-3-pro-image-preview" : "gemini-3.1-flash-image-preview";

    console.log(`Generating image using model: ${model} with aspect ratio: ${aspectRatio} and size: ${imageSize}`);

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || "1:1",
          imageSize: imageSize || "1K",
        },
      },
    });

    // Find the inlineData representing the generated image
    let base64Image = "";
    let accompanyingText = "";

    const candidates = response.candidates;
    if (candidates && candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
        } else if (part.text) {
          accompanyingText += part.text;
        }
      }
    }

    if (!base64Image) {
      throw new Error("No image was returned from the model. Please check the prompt or model configuration.");
    }

    res.json({
      success: true,
      imageUrl: `data:image/png;base64,${base64Image}`,
      description: accompanyingText,
    });
  } catch (error: any) {
    console.error("Image generation error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to generate image blueprint" });
  }
});

// Serve static assets in production, hook Vite in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Quantum AI] Server running on http://localhost:${PORT}`);
  });
}

startServer();
