import { NextResponse } from "next/server";

/**
 * POST /api/chat
 *
 * Proxies chat requests to Perplexity AI API using the PPLX environment variable.
 * This route is designed for production deployment on AWS Amplify.
 *
 * Required environment variable: PPLX (configured in Amplify Console: Hosting -> Environment variables)
 */
const MIN_PPLX_KEY_LENGTH = 10;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.PPLX?.trim();

    if (!apiKey) {
      console.error("PPLX environment variable not found");
      console.error("Ensure PPLX is configured via Amplify Hosting -> Environment variables or a local .env file");
      return NextResponse.json({
        error: "API configuration error",
        message: "Chat service is not properly configured (missing PPLX environment variable)"
      }, { status: 500 });
    }

    if (apiKey.length < MIN_PPLX_KEY_LENGTH) {
      console.error(`PPLX environment variable length ${apiKey.length} is invalid (minimum: ${MIN_PPLX_KEY_LENGTH})`);
      return NextResponse.json({
        error: "API configuration error",
        message: "Chat service configuration is invalid (PPLX key is malformed)"
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
    const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    return NextResponse.json({
      error: "Internal server error",
      message: "An unexpected error occurred",
      detail
    }, { status: 500 });
  }
}
