import { publicRequest } from "@/lib/api/client";
import type { ApiResponse } from "@/types/auth";

export type AiSource = {
  id?: string;
  title?: string;
  type?: string;
  subtitle?: string;
  content?: string;
  url?: string;
  score?: number;
};

export type AiChatResponse = {
  answer: string;
  model: string;
  retrievalStrategy: string;
  notes: string;
  sources: AiSource[];
};

export async function askMarketplaceAi(question: string): Promise<AiChatResponse> {
  const response = await publicRequest<ApiResponse<AiChatResponse>>("/chat/ask", {
    method: "POST",
    body: JSON.stringify({
      question,
      limit: 6,
      minScore: 0.02,
    }),
  });

  return response.data;
}
