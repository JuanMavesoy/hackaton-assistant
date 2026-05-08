export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  message: string;
  recommendedProduct: string;
  simulation: Simulation | null;
  cta: string;
  showCta: boolean;
  speakResponse: boolean;
}

export interface Simulation {
  monthlyAmount: number;
  months: number;
  estimatedSavings: number;
}