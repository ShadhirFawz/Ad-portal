import api from "@/lib/api";

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
  const response = await api.post("/api/v1/chat/ask", {
    question,
    limit: 6,
    minScore: 0.02,
  });

  const payload = response?.data;
  return payload?.data ?? payload;
}