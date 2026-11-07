"use client";

import { askMarketplaceAi } from "@/lib/api/ai";
import { FormEvent, useState } from "react";

type AiSource = {
  id?: string;
  title?: string;
  type?: string;
  subtitle?: string;
  content?: string;
  url?: string;
  score?: number;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: AiSource[];
};

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Hi! Ask me about listings, categories, sellers, or local marketplace trends. I answer from the indexed marketplace data.",
  },
];

export default function AiChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = input.trim();

    if (!question || loading) return;

    const userMessage: ChatMessage = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const data = await askMarketplaceAi(question);
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content:
          data?.answer ||
          "I could not find a confidently grounded answer for that question.",
        sources: Array.isArray(data?.sources) ? data.sources : [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (caughtError: unknown) {
      console.error("AI chat request failed:", caughtError);
      const detail = caughtError instanceof Error ? caughtError.message : String(caughtError);
      setError(
        detail.includes("failed") || detail.includes("network") || detail.includes("fetch")
          ? "The AI backend is not reachable right now. Please verify the backend is running at http://localhost:8080."
          : detail
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I could not reach the marketplace AI backend. Please verify the backend is running locally at http://localhost:8080 (or your configured NEXT_PUBLIC_API_URL).",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0b0f19] dark:text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-400">
            Wudo AI
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Marketplace AI Assistant</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Ask about listings, prices, categories, local neighborhoods, and sellers.
            Every answer is grounded in the indexed marketplace data.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <div className="flex h-[75vh] flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-3xl rounded-2xl px-4 py-3 shadow-sm ${
                      message.role === "user"
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-800 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-7">
                      {message.content}
                    </div>

                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-4 space-y-3 border-t border-slate-200 pt-3 dark:border-slate-700">
                        {message.sources.map((source, sourceIndex) => (
                          <div
                            key={`${source.title ?? "source"}-${sourceIndex}`}
                            className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950/60"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                {source.title ?? "Marketplace result"}
                              </p>
                              {source.score !== undefined && (
                                <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                  {(source.score * 100).toFixed(0)}%
                                </span>
                              )}
                            </div>

                            {source.subtitle && (
                              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                                {source.subtitle}
                              </p>
                            )}

                            {source.content && (
                              <p className="mt-2 text-sm text-slate-700 dark:text-slate-200 line-clamp-3">
                                {source.content}
                              </p>
                            )}

                            {source.url && (
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-block text-xs text-sky-600 underline dark:text-sky-400"
                              >
                                Open result
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                    Thinking...
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300">
                  {error}
                </div>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60 sm:p-5"
            >
              <div className="flex gap-3">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about apartments, electronics, sellers, or categories..."
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-emerald-500/30"
                  aria-label="Marketplace AI question"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Asking..." : "Ask"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
