import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatApiResponse {
  message: string;
  recommendedProduct: string;
  simulation: {
    monthlyAmount: number;
    months: number;
    estimatedSavings: number;
  } | null;
  cta: string;
  showCta: boolean;
  speakResponse: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AssistantApiService {
  private readonly apiUrl = 'https://localhost:7238/api/chat';

  constructor(private readonly http: HttpClient) {}

  send(message: string): Observable<ChatApiResponse> {
    return this.http.post<ChatApiResponse>(this.apiUrl, { message });
  }
}