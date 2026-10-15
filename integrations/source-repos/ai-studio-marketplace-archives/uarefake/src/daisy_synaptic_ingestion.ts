import fs from 'fs';

// Core Domain Categories across Daisy's 6 Synaptic Vector Layers
export type TrainingDomain = 
  | 'LANGUAGE_STRUCTURE' 
  | 'ACADEMIC_COLLEGE' 
  | 'WORKPLACE_CONDUCT' 
  | 'MANAGEMENT_LEADERSHIP' 
  | 'ECONOMIC_PAIN_POINTS' 
  | 'PARADOX_LOGIC';

export interface CleanedSegment {
  domain: TrainingDomain;
  rawText: string;
  normalizedText: string;
  keywords: string[];
  boundParadoxAnchor: number;
}

export class DaisySynapticIngestionEngine {
  // Domain keyword triggers to auto-route raw transcript chunks across the 6 operational knowledge domains
  private static DOMAIN_SIGNATURES: Record<TrainingDomain, RegExp> = {
    LANGUAGE_STRUCTURE: /(grammar|syntax|verb|noun|clause|sentence|vocabulary|pronunciation)/i,
    ACADEMIC_COLLEGE: /(lecture|theorem|hypothesis|analysis|framework|methodology|curriculum)/i,
    WORKPLACE_CONDUCT: /(compliance|policy|hr|harassment|protocol|de-escalation|professionalism)/i,
    MANAGEMENT_LEADERSHIP: /(delegation|strategy|executive|performance|team|conflict resolution)/i,
    ECONOMIC_PAIN_POINTS: /(roi|margin|waste|overhead|inflation|cash flow|bottleneck|cost-benefit)/i,
    PARADOX_LOGIC: /(paradox|self-reference|contradiction|deadlock|boundary condition|zeno|russell)/i
  };

  /**
   * Cleans raw VTT/SRT transcript text by removing timestamps, metadata, and speaker tags.
   */
  public static normalizeCaptionText(rawVtt: string): string {
    return rawVtt
      .replace(/WEBVTT.*/gi, '') // Remove VTT header
      .replace(/\d{2}:\d{2}:\d{2}\.\d{3}\s-->\s\d{2}:\d{2}:\d{2}\.\d{3}.*/g, '') // Remove timestamps
      .replace(/<\/?v[^>]*>/gi, '') // Remove speaker tags
      .replace(/<[^>]*>/g, '') // Remove HTML styling tags
      .replace(/^\d+$/gm, '') // Remove cue numbers
      .replace(/\n\s*\n/g, '\n') // Collapse blank lines
      .trim();
  }

  /**
   * Classifies clean text into one of Daisy's 6 operational knowledge domains.
   */
  public static classifyDomain(text: string): TrainingDomain {
    for (const [domain, regex] of Object.entries(this.DOMAIN_SIGNATURES)) {
      if (regex.test(text)) {
        return domain as TrainingDomain;
      }
    }
    // Default fallback to general workplace conduct if unclassified
    return 'WORKPLACE_CONDUCT';
  }

  /**
   * Binds the incoming semantic concept to one of Daisy's 88 Paradox Solution Anchors.
   */
  public static bindToParadoxAnchor(domain: TrainingDomain, text: string): number {
    // Dynamic hashing algorithm to map text & domain to anchor IDs [1..88]
    let hash = 0;
    const combined = `${domain}:${text.slice(0, 50)}`;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash << 5) - hash + combined.charCodeAt(i);
      hash |= 0;
    }
    const anchorId = (Math.abs(hash) % 88) + 1; // Maps strictly between 1 and 88
    return anchorId;
  }

  /**
   * Processes in-memory or uploaded transcript raw text content directly into Daisy's synaptic index.
   */
  public static processTranscriptText(rawContent: string): CleanedSegment[] {
    const cleanText = this.normalizeCaptionText(rawContent);
    
    // Split text into paragraphs/chunks for vector processing
    const paragraphs = cleanText.split(/\n{2,}/);
    const processedSegments: CleanedSegment[] = [];

    for (const paragraph of paragraphs) {
      if (paragraph.trim().length < 20) continue;

      const domain = this.classifyDomain(paragraph);
      const anchorId = this.bindToParadoxAnchor(domain, paragraph);
      
      const keywords = paragraph
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .split(/\s+/)
        .filter(w => w.length > 5);

      processedSegments.push({
        domain,
        rawText: paragraph,
        normalizedText: paragraph.replace(/\s+/g, ' '),
        keywords: Array.from(new Set(keywords)).slice(0, 8),
        boundParadoxAnchor: anchorId
      });
    }

    console.log(`[DAISY SYNAPTIC ENGINE] Processed ${processedSegments.length} concept nodes across 6 domains.`);
    return processedSegments;
  }

  /**
   * Main Pipeline Execution: Processes raw transcript files into Daisy's synaptic index.
   */
  public static processTranscript(filePath: string): CleanedSegment[] {
    if (!fs.existsSync(filePath)) {
      console.warn(`[DAISY SYNAPTIC ENGINE] File path not found: ${filePath}`);
      return [];
    }
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    return this.processTranscriptText(rawContent);
  }
}
