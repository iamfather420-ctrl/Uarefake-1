import fs from 'fs';
import path from 'path';

export type VerifiedDomain = 
  | 'LANGUAGE_NORMS' 
  | 'ACADEMIC_CURRICULUM' 
  | 'EMPLOYEE_HANDBOOK_CONDUCT' 
  | 'MANAGEMENT_OPERATIONS' 
  | 'ECONOMIC_ANALYSIS' 
  | 'FORMAL_PARADOX_LOGIC';

export interface VerifiedTextChunk {
  domain: VerifiedDomain;
  sourceUri: string;
  cleanText: string;
  keywords: string[];
  boundParadoxAnchor: number;
}

export class DaisyVerifiedTextIngestionEngine {
  // Domain regex triggers tuned for formal written text
  private static DOMAIN_SIGNATURES: Record<VerifiedDomain, RegExp> = {
    LANGUAGE_NORMS: /(syntax|grammar|lexicon|semantic|morphology|rhetoric|nomenclature)/i,
    ACADEMIC_CURRICULUM: /(syllabus|methodology|thesis|abstract|empirical|peer-reviewed|curriculum)/i,
    EMPLOYEE_HANDBOOK_CONDUCT: /(employee handbook|compliance|code of conduct|policy|equal opportunity|non-disclosure|protocol)/i,
    MANAGEMENT_OPERATIONS: /(standard operating procedure|sop|delegation|governance|kpi|performance review|stakeholder)/i,
    ECONOMIC_ANALYSIS: /(margin|fiscal|overhead|cash flow|amortization|cost-benefit|microeconomics|macroeconomics)/i,
    FORMAL_PARADOX_LOGIC: /(paradox|self-reference|contradiction|tautology|axiom|decision theory|boundary condition)/i
  };

  /**
   * Normalizes raw written document text by stripping markup and normalizing whitespace.
   */
  public static normalizeDocumentText(rawText: string): string {
    return rawText
      .replace(/<[^>]*>/g, '') // Strip HTML tags if scraping web documentation
      .replace(/#+\s+/g, '') // Strip Markdown header tags
      .replace(/\r\n/g, '\n') // Normalize line breaks
      .replace(/\n{3,}/g, '\n\n') // Collapse excessive line breaks
      .trim();
  }

  /**
   * Classifies clean document text into one of Daisy's 6 core knowledge domains.
   */
  public static classifyDomain(text: string): VerifiedDomain {
    for (const [domain, regex] of Object.entries(this.DOMAIN_SIGNATURES)) {
      if (regex.test(text)) {
        return domain as VerifiedDomain;
      }
    }
    return 'EMPLOYEE_HANDBOOK_CONDUCT';
  }

  /**
   * Hashes text chunk and binds it deterministically to 1 of 88 Paradox Solution Anchors.
   */
  public static bindToParadoxAnchor(domain: VerifiedDomain, text: string): number {
    let hash = 0;
    const sample = `${domain}:${text.slice(0, 100)}`;
    for (let i = 0; i < sample.length; i++) {
      hash = (hash << 5) - hash + sample.charCodeAt(i);
      hash |= 0;
    }
    return (Math.abs(hash) % 88) + 1;
  }

  /**
   * Main Pipeline execution: Ingests verified text files or scraped document strings.
   */
  public static ingestVerifiedDocument(rawDocument: string, sourceUri: string = 'local_file'): VerifiedTextChunk[] {
    const cleanText = this.normalizeDocumentText(rawDocument);
    
    // Split text naturally by paragraphs
    const paragraphs = cleanText.split(/\n\n+/);
    const ingestedChunks: VerifiedTextChunk[] = [];

    for (const paragraph of paragraphs) {
      if (paragraph.trim().length < 40) continue; // Skip short headers/footers

      const domain = this.classifyDomain(paragraph);
      const anchorId = this.bindToParadoxAnchor(domain, paragraph);
      
      const keywords = paragraph
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .split(/\s+/)
        .filter(w => w.length > 5);

      ingestedChunks.push({
        domain,
        sourceUri,
        cleanText: paragraph.replace(/\s+/g, ' '),
        keywords: Array.from(new Set(keywords)).slice(0, 10),
        boundParadoxAnchor: anchorId
      });
    }

    console.log(`[DAISY TEXT ENGINE] Ingested ${ingestedChunks.length} verified text nodes from [${sourceUri}].`);
    return ingestedChunks;
  }
}
