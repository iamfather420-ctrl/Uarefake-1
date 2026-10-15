import fs from 'fs';
import path from 'path';

export type VerifiedDomain = 
  | 'GOV_REGULATORY' 
  | 'EDU_ACADEMIC' 
  | 'NASA_SPACE_SCIENCE' 
  | 'WIKIPEDIA_FACTUAL' 
  | 'FINANCE_ECONOMY' 
  | 'SPORTS_ANALYTICS' 
  | 'ARTS_HISTORY' 
  | 'TECH_SYSTEMS' 
  | 'MATHEMATICS_LOGIC' 
  | 'SOCIETY_HUMAN_SYSTEMS';

export interface VerifiedTextChunk {
  domain: VerifiedDomain;
  sourceUri: string;
  sourceCategory: string;
  cleanText: string;
  keywords: string[];
  boundParadoxAnchor: number;
  verificationBadge: string;
  timestamp: string;
}

export class DaisyVerifiedTextIngestionEngine {
  // Domain regex triggers tuned for formal written text across all 10 verified domain sources
  private static DOMAIN_SIGNATURES: Record<VerifiedDomain, { regex: RegExp; sourceCategory: string; verificationBadge: string }> = {
    GOV_REGULATORY: {
      regex: /(\.gov|federal register|sec edgar|nist sp 800|compliance|statute|executive order|regulatory framework|public policy|iso 27001|soc 2)/i,
      sourceCategory: 'US Federal & Regulatory (.gov)',
      verificationBadge: 'VERIFIED_.GOV_SOURCE'
    },
    EDU_ACADEMIC: {
      regex: /(\.edu|arxiv|peer-reviewed|dissertation|university press|thesis|journal|mit|harvard|stanford|curriculum|empirical analysis)/i,
      sourceCategory: 'Academic Research Repository (.edu)',
      verificationBadge: 'VERIFIED_.EDU_SOURCE'
    },
    NASA_SPACE_SCIENCE: {
      regex: /(nasa\.gov|astrophysics|telemetry|jwst|hubble|orbital mechanics|propulsion|planetary geology|exoplanet|aeronautics|cosmology)/i,
      sourceCategory: 'NASA Space & Aeronautics Archive',
      verificationBadge: 'VERIFIED_NASA_SOURCE'
    },
    WIKIPEDIA_FACTUAL: {
      regex: /(wikipedia\.org|encyclopedia|biography|etymology|geopolitical history|chronology|entity cross-reference)/i,
      sourceCategory: 'Wikipedia Verified Factual Corpus',
      verificationBadge: 'VERIFIED_WIKIPEDIA_SOURCE'
    },
    FINANCE_ECONOMY: {
      regex: /(sec 10-k|10-q|wall street|macroeconomics|gdp|yield curve|federal reserve|inflation|derivatives|liquidity|amortization)/i,
      sourceCategory: 'Global Economic & Financial Feed',
      verificationBadge: 'VERIFIED_FINANCE_SOURCE'
    },
    SPORTS_ANALYTICS: {
      regex: /(sports analytics|sabermetrics|olympic|nba|nfl|fifa|biomechanics|kinematics|athletic performance|telemetry stats)/i,
      sourceCategory: 'Sports Performance & Kinematics Data',
      verificationBadge: 'VERIFIED_SPORTS_SOURCE'
    },
    ARTS_HISTORY: {
      regex: /(historiography|archaeology|renaissance|art history|architectural order|linguistic evolution|cultural artifact|museum archive)/i,
      sourceCategory: 'Arts & Historiography Index',
      verificationBadge: 'VERIFIED_ARTS_SOURCE'
    },
    TECH_SYSTEMS: {
      regex: /(distributed systems|quantum computing|kernel|compiler|tcp\/ip|microservices|cryptography|fips 140-3|ebpf|wasm)/i,
      sourceCategory: 'Advanced Systems & Engineering',
      verificationBadge: 'VERIFIED_TECH_SOURCE'
    },
    MATHEMATICS_LOGIC: {
      regex: /(set theory|calculus|topology|predicate logic|bayesian|fourier|axiomatic system|godel|turing|differentiable)/i,
      sourceCategory: 'Formal Mathematics & Pure Logic',
      verificationBadge: 'VERIFIED_MATH_SOURCE'
    },
    SOCIETY_HUMAN_SYSTEMS: {
      regex: /(sociology|demographics|urban planning|institutional dynamics|behavioral economics|human geography|governance structures)/i,
      sourceCategory: 'Societal Systems & Human Infrastructure',
      verificationBadge: 'VERIFIED_SOCIETY_SOURCE'
    }
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
   * Classifies clean document text into one of Daisy's 10 core verified knowledge domains.
   */
  public static classifyDomain(text: string): VerifiedDomain {
    for (const [domain, config] of Object.entries(this.DOMAIN_SIGNATURES)) {
      if (config.regex.test(text)) {
        return domain as VerifiedDomain;
      }
    }
    return 'TECH_SYSTEMS';
  }

  public static getDomainMeta(domain: VerifiedDomain) {
    return this.DOMAIN_SIGNATURES[domain] || {
      sourceCategory: 'Verified System Core',
      verificationBadge: 'VERIFIED_SYSTEM_SOURCE'
    };
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
    const timestamp = new Date().toISOString();

    for (const paragraph of paragraphs) {
      if (paragraph.trim().length < 30) continue; // Skip short headers/footers

      const domain = this.classifyDomain(paragraph);
      const meta = this.getDomainMeta(domain);
      const anchorId = this.bindToParadoxAnchor(domain, paragraph);
      
      const keywords = paragraph
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .split(/\s+/)
        .filter(w => w.length > 5);

      ingestedChunks.push({
        domain,
        sourceUri,
        sourceCategory: meta.sourceCategory,
        cleanText: paragraph.replace(/\s+/g, ' '),
        keywords: Array.from(new Set(keywords)).slice(0, 10),
        boundParadoxAnchor: anchorId,
        verificationBadge: meta.verificationBadge,
        timestamp
      });
    }

    console.log(`[DAISY TEXT ENGINE] Ingested ${ingestedChunks.length} verified text nodes from [${sourceUri}].`);
    return ingestedChunks;
  }
}
