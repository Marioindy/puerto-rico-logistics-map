import { NextResponse } from "next/server";
import { secret } from "@aws-amplify/backend";

/**
 * POST /api/chat
 *
 * Proxies chat requests to Perplexity AI API using the PPLX secret configured in AWS Amplify.
 * This route is designed for production deployment on AWS Amplify only.
 *
 * Required secret: PPLX (configured in Amplify Console: Hosting -> Secrets)
 */
const pplxSecret = secret("PPLX");
const MIN_PPLX_KEY_LENGTH = 10;

type ApiKeyResolution =
  | { status: "resolved"; apiKey: string; source: "secret" | "env" }
  | { status: "invalid"; source: "secret" | "env"; length: number }
  | { status: "missing" };

const resolvePplxApiKey = (): ApiKeyResolution => {
  const secretRaw = pplxSecret as unknown;
  const secretCandidate = typeof secretRaw === "string" ? secretRaw.trim() : undefined;

  if (secretRaw && typeof secretRaw !== "string") {
    console.warn("PPLX secret returned non-string value from secret(\"PPLX\") - falling back to process.env");
  }

  if (secretCandidate) {
    if (secretCandidate.length >= MIN_PPLX_KEY_LENGTH) {
      return { status: "resolved", apiKey: secretCandidate, source: "secret" };
    }
    return { status: "invalid", source: "secret", length: secretCandidate.length };
  }

  const envCandidate = process.env.PPLX?.trim();

  if (envCandidate) {
    if (envCandidate.length >= MIN_PPLX_KEY_LENGTH) {
      return { status: "resolved", apiKey: envCandidate, source: "env" };
    }
    return { status: "invalid", source: "env", length: envCandidate.length };
  }

  return { status: "missing" };
};

export async function POST(req: Request) {
  try {
    const resolvedApiKey = resolvePplxApiKey();

    if (resolvedApiKey.status === "missing") {
      console.error("PPLX secret not resolved (secret(\"PPLX\") returned no value)");
      console.error("Ensure PPLX is configured via Amplify Hosting -> Secrets or a local .env file");
      return NextResponse.json({
        error: "API configuration error",
        message: "Chat service is not properly configured (missing PPLX secret)"
      }, { status: 500 });
    }

    if (resolvedApiKey.status === "invalid") {
      console.error(`PPLX secret resolved from ${resolvedApiKey.source} but length ${resolvedApiKey.length} is invalid`);
      return NextResponse.json({
        error: "API configuration error",
        message: "Chat service configuration is invalid (PPLX secret is malformed)"
      }, { status: 500 });
    }

    const { apiKey } = resolvedApiKey;

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
