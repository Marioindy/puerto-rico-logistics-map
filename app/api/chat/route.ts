import { NextResponse } from "next/server";

/**
 * POST /api/chat
 *
 * Proxies chat requests to Perplexity AI API using the PPLX secret configured in AWS Amplify.
 * This route is designed for production deployment on AWS Amplify only.
 *
 * Secrets are configured in Amplify Console: Hosting → Secrets → PPLX
 * and made available as environment variables through amplify.yml build configuration.
 */
export async function POST(req: Request) {
  try {
    // Get Perplexity API key from environment (injected by Amplify during build)
    const apiKey = process.env.PPLX;

    if (!apiKey) {
      console.error("PPLX API key not found in environment variables");
      return NextResponse.json({
        error: "API configuration error",
        message: "Required API key not available"
      }, { status: 500 });
    }

    // Parse request body
    const { messages } = await req.json() as {
      messages: { role: "system" | "user" | "assistant"; content: string }[];
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({
        error: "Invalid request format",
        message: "Messages array is required"
      }, { status: 400 });
    }

    // Call Perplexity AI API
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "sonar",
        messages: messages,
        temperature: 0.2,
        stream: false
      })
    });

    if (!response.ok) {
      let errorMessage = "Perplexity API error";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
      } catch {
        errorMessage = await response.text() || errorMessage;
      }

      console.error("Perplexity API error:", {
        status: response.status,
        statusText: response.statusText,
        message: errorMessage
      });

      return NextResponse.json({
        error: "External API error",
        message: errorMessage
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({
      error: "Internal server error",
      message: "An unexpected error occurred"
    }, { status: 500 });
  }
}