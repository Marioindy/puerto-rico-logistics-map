"use client";

import { useState, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";

export type ChatMessage = { role: "user" | "assistant"; content: string };

const DEBUG_OUTPUT_LIMIT = 800;

const formatDebugPayload = (payload: unknown): string => {
  if (payload === null || payload === undefined) {
    return "No response body received.";
  }

  if (typeof payload === "string") {
    if (payload.length > DEBUG_OUTPUT_LIMIT) {
      return `${payload.slice(0, DEBUG_OUTPUT_LIMIT)}... (truncated)`;
    }
    return payload;
  }

  try {
    const serialized = JSON.stringify(payload, null, 2);
    if (serialized.length > DEBUG_OUTPUT_LIMIT) {
      return `${serialized.slice(0, DEBUG_OUTPUT_LIMIT)}... (truncated)`;
    }
    return serialized;
  } catch {
    return "Unable to serialize response payload for debugging.";
  }
};

export default function ChatbotFab() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (!listRef.current) return;
    listRef.current.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth"
    });
  };

  const appendAssistantMessage = (content: string) => {
    setMessages((prev) => [...prev, { role: "assistant", content }]);
    setTimeout(scrollToBottom, 0);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    const nextMsgs = [...messages, userMessage];
    setMessages(nextMsgs);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are an assistant for the Puerto Rico RFI Map. Be concise and helpful."
            },
            ...nextMsgs
          ]
        })
      });

      const rawBody = await resp.text();
      let parsedBody: unknown = null;

      if (rawBody) {
        try {
          parsedBody = JSON.parse(rawBody);
        } catch {
          parsedBody = rawBody;
        }
      }

      if (!resp.ok) {
        const debugDetails = formatDebugPayload(parsedBody ?? rawBody);
        appendAssistantMessage(
          `Chat service responded with ${resp.status} ${resp.statusText}.

${debugDetails}`
        );
        return;
      }

      const assistantContent =
        typeof parsedBody === "object" && parsedBody !== null
          ? (parsedBody as any)?.choices?.[0]?.message?.content
          : undefined;

      if (typeof assistantContent !== "string" || !assistantContent.trim()) {
        const debugDetails = formatDebugPayload(parsedBody ?? rawBody);
        appendAssistantMessage(
          `Chat service returned no assistant message.

${debugDetails}`
        );
        return;
      }

      appendAssistantMessage(assistantContent.trim());
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error ?? "Unknown error");
      appendAssistantMessage(`Chat request failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#4b5a2a] text-[#f6f4ea] shadow-lg transition hover:bg-[#3f4b22]"
        aria-label="Open assistant"
      >
        <MessageCircle className="h-5 w-5" />
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] max-w-md rounded-2xl border border-[#e3dcc9] bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-[#e3dcc9] px-4 py-3">
            <div className="text-sm font-semibold text-[#2e2f25]">RFI Assistant</div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full border border-[#d7d1c3] p-1 text-[#2e2f25] hover:bg-[#faf9f5]"
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={listRef} className="max-h-[50vh] overflow-y-auto px-4 py-3 text-sm">
            {messages.length === 0 ? (
              <p className="text-[#6f705f]">Ask about facilities, airports, ports, or RFI details.</p>
            ) : (
              <ul className="space-y-3">
                {messages.map((m, i) => (
                  <li key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                    <span
                      className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 ${
                        m.role === "user"
                          ? "bg-[#dfe8c9] text-[#2f3818]"
                          : "bg-[#faf9f5] text-[#1b1c16] border border-[#e3dcc9]"
                      }`}
                    >
                      {m.content}
                    </span>
                  </li>
                ))}
                {loading && <li className="text-left text-[#6f705f]">Thinking.</li>}
              </ul>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-[#e3dcc9] px-3 py-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type your question."
              className="flex-1 rounded-md border border-[#d7d1c3] bg-white px-3 py-2 text-sm text-[#1b1c16] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4b5a2a]"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="inline-flex items-center gap-2 rounded-md bg-[#4b5a2a] px-3 py-2 text-sm font-semibold text-[#f6f4ea] transition hover:bg-[#3f4b22] disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
