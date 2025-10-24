
export interface VideoAnalysis {
  id: string;
  videoUrl: string;
  title: string; // Extracted from the report for history display
  timestamp: string;
  report: string; // The full markdown report from Gemini
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  sources?: { uri: string; title: string }[];
}