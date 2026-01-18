export enum Persona {
  VISUAL = 'VISUAL',
  MOTOR = 'MOTOR',
  COLOR = 'COLOR'
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  persona: Persona;
  element?: string;
  location?: { x: number; y: number }; // Percentage 0-100
  codeSnippet?: string;
  suggestedFix?: string;
  explanation?: string;
  file?: string;
}

export interface AnalysisResult {
  url: string;
  timestamp: string;
  score: number;
  issues: Issue[];
}

export type AnalysisStatus = 'IDLE' | 'ANALYZING' | 'COMPLETE' | 'ERROR';

export interface AuditConfig {
  url: string;
  githubRepo?: string;
  personas: Persona[];
  // For the purpose of this demo, we allow raw inputs since we can't scrape client-side
  rawHtml?: string; 
  screenshotBase64?: string;
}
