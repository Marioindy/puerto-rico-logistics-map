"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Shield,
  X,
  Send,
  Loader2,
  Database,
  FileText,
  Upload,
  LogOut,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import type { ThreadMessage } from "../lib/types";

/**
 * JaynetteAdmin Component
 *
 * Administrative interface for the Jaynette database management agent.
 * Provides secure, session-based access to advanced database operations.
 *
 * Features:
 * - Password-protected authentication
 * - Session management with auto-expiration
 * - Full CRUD operations on facilities
 * - Bulk import with dry-run mode
 * - Report generation
 * - Real-time messaging via Convex queries
 *
 * @example
 * <JaynetteAdmin />
 */
export default function JaynetteAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [message, setMessage] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get conversation history
  const messages = useQuery(
    api.agents.jaynette.getThreadMessages,
    threadId && sessionToken ? { threadId, sessionToken } : "skip"
  ) as ThreadMessage[] | undefined;

  // Session validation
  const sessionStatus = useQuery(
    api.adminSessions.validate,
    sessionToken ? { token: sessionToken } : "skip"
  );

  // Mutations
  const authenticate = useMutation(api.adminSessions.authenticate);
  const createThread = useMutation(api.agents.jaynette.createThread);
  const sendMessage = useMutation(api.agents.jaynette.adminChat);
  const logout = useMutation(api.adminSessions.invalidate);

  // Check session validity
  useEffect(() => {
    if (sessionStatus && !sessionStatus.valid) {
      handleLogout();
      toast.error("Session expired. Please log in again.");
    }
  }, [sessionStatus]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsAuthenticating(true);
    try {
      const result = await authenticate({ password });
      setSessionToken(result.token);
      setIsAuthenticated(true);
      setPassword("");
      toast.success("Authenticated successfully");

      // Create thread
      const thread = await createThread({ sessionToken: result.token });
      setThreadId(thread.threadId);
    } catch (error) {
      toast.error("Authentication failed. Check your password.");
      console.error("Auth error:", error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    if (sessionToken) {
      try {
        await logout({ token: sessionToken });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    setIsAuthenticated(false);
    setSessionToken(null);
    setThreadId(null);
    toast.info("Logged out successfully");
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !threadId || !sessionToken || isLoading) return;

    const userMessage = message;
    setMessage("");
    setIsLoading(true);

    try {
      await sendMessage({
        sessionToken,
        threadId,
        message: userMessage,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (quickMessage: string) => {
    setMessage(quickMessage);
  };

  // Quick action buttons for admin operations
  const quickActions = [
    {
      icon: <Database className="w-4 h-4" />,
      label: "Create facility",
      message: "I need to create a new warehouse facility",
    },
    {
      icon: <FileText className="w-4 h-4" />,
      label: "Generate report",
      message: "Generate a summary report of all facilities",
    },
    {
      icon: <Upload className="w-4 h-4" />,
      label: "Bulk import",
      message: "Help me prepare a bulk import with dry-run mode",
    },
  ];

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-indigo-600 rounded-full p-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Jaynette Admin
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Database Management Interface
          </p>
          <form onSubmit={handleAuthenticate} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Admin Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                disabled={isAuthenticating}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
              />
            </div>
            <button
              type="submit"
              disabled={isAuthenticating || !password.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg py-2 font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">
              <strong>⚠️ Restricted Access:</strong> This interface provides
              full database access. Only authorized administrators should use
              this system.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Admin chat interface
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-bold">Jaynette Admin</h1>
                <p className="text-sm text-indigo-200">
                  Database Management Interface
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-indigo-200">Session expires:</span>
                <span className="ml-2 font-mono">
                  {sessionStatus?.session?.expiresAt
                    ? new Date(sessionStatus.session.expiresAt).toLocaleTimeString()
                    : "N/A"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow border border-gray-200 h-[calc(100vh-200px)] flex flex-col">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {!threadId ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : messages && messages.length > 0 ? (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white"
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
                      <p>{msg.content}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <Shield className="w-16 h-16 mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Welcome, Administrator
                </h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  I&apos;m Jaynette, your administrative assistant. I can help you
                  create, update, delete facilities, perform bulk imports, and
                  generate reports.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-2xl">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(action.message)}
                      className="flex items-center gap-2 px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                    >
                      {action.icon}
                      <span className="text-sm font-medium">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex gap-3">
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
                placeholder="Describe the database operation you need..."
                disabled={isLoading || !threadId}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !message.trim() || !threadId}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg px-6 py-3 transition-colors flex items-center gap-2"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
                <span>Send</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Powered by Claude 3.5 Sonnet via OpenRouter • Session-based
              authentication active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
