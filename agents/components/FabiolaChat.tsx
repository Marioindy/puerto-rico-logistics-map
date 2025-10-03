"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MessageCircle, X, Send, Loader2, MapPin, Warehouse, Plane } from "lucide-react";
import ReactMarkdown from "react-markdown";

/**
 * FabiolaChat Component
 *
 * A floating chat widget for the Fabiola logistics assistant.
 * Provides bilingual (English/Spanish) support for facility searches,
 * nearby location queries, and general logistics assistance.
 *
 * Features:
 * - Real-time messaging via Convex queries
 * - Quick action buttons for common queries
 * - Minimizable floating widget
 * - Markdown support for rich responses
 * - Loading states and error handling
 *
 * @example
 * <FabiolaChat />
 */
export default function FabiolaChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get conversation history
  const messages = useQuery(
    api.agents.fabiola.getThreadMessages,
    threadId ? { threadId } : "skip"
  );

  // Create new thread
  const createThread = useMutation(api.agents.fabiola.createThread);

  // Send message
  const sendMessage = useMutation(api.agents.fabiola.chat);

  // Initialize thread when chat opens
  useEffect(() => {
    if (isOpen && !threadId) {
      createThread({}).then((result) => {
        setThreadId(result.threadId);
      });
    }
  }, [isOpen, threadId, createThread]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !threadId || isLoading) return;

    const userMessage = message;
    setMessage("");
    setIsLoading(true);

    try {
      await sendMessage({
        threadId,
        message: userMessage,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (quickMessage: string) => {
    setMessage(quickMessage);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Quick action buttons
  const quickActions = [
    {
      icon: <Warehouse className="w-4 h-4" />,
      label: "Find warehouses",
      message: "Show me all warehouses in Puerto Rico",
    },
    {
      icon: <Plane className="w-4 h-4" />,
      label: "Airports & Ports",
      message: "What airports and ports are available?",
    },
    {
      icon: <MapPin className="w-4 h-4" />,
      label: "Nearby facilities",
      message: "Find facilities near San Juan",
    },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110 z-50"
        aria-label="Open chat with Fabiola"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 transition-all duration-300 ${
        isMinimized ? "h-16" : "h-[600px]"
      } w-[400px]`}
    >
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <div>
            <h3 className="font-semibold">Fabiola</h3>
            <p className="text-xs text-blue-100">Logistics Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMinimize}
            className="hover:bg-blue-700 rounded p-1 transition-colors"
            aria-label={isMinimized ? "Maximize" : "Minimize"}
          >
            <span className="text-xl leading-none">
              {isMinimized ? "□" : "−"}
            </span>
          </button>
          <button
            onClick={toggleChat}
            className="hover:bg-blue-700 rounded p-1 transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[400px]">
            {!threadId ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : messages && messages.length > 0 ? (
              messages.map((msg: any, idx: number) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mb-3 text-gray-300" />
                <h4 className="font-medium text-gray-700 mb-1">
                  ¡Hola! I'm Fabiola
                </h4>
                <p className="text-sm mb-4">
                  Your bilingual logistics assistant for Puerto Rico.
                  <br />
                  Ask me about facilities, locations, or logistics services!
                </p>
                <div className="flex flex-col gap-2 w-full">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(action.message)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm transition-colors"
                    >
                      {action.icon}
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask about facilities, locations..."
                disabled={isLoading || !threadId}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !message.trim() || !threadId}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg p-2 transition-colors"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Powered by Claude 3 Haiku via OpenRouter
            </p>
          </div>
        </>
      )}
    </div>
  );
}
