import { NextResponse } from "next/server";

// Function to get PPLX API key from AWS Amplify secrets or local environment
function getPPLXApiKey(): string | null {
  const apiKey = process.env.PPLX;

  // Debug logging for Amplify deployment troubleshooting
  console.log("Environment check:", {
    hasAPIKey: !!apiKey,
    nodeEnv: process.env.NODE_ENV,
    amplifyEnv: process.env.AMPLIFY_ENV || "not-set",
    // Only log first/last chars for security
    keyPreview: apiKey ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : "null"
  });

  return apiKey || null;
}

export async function POST(req: Request) {
  try {
    const apiKey = getPPLXApiKey();
    if (!apiKey) {
      const errorMsg = "PPLX API key not found. Check: 1) Amplify Console → Hosting → Secrets → PPLX is set, 2) amplify.yml writes secrets to .env.production, 3) local .env.local has PPLX";
      console.error(errorMsg);
      return NextResponse.json({
        error: "Missing PPLX API key",
        debug: "Check server logs for environment details"
      }, { status: 500 });
    }

    const { messages } = (await req.json()) as {
      messages: { role: "system" | "user" | "assistant"; content: string }[];
    };

    const resp = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "sonar",
        messages: messages ?? [{ role: "user", content: "Hello" }],
        temperature: 0.2,
        stream: false
      })
    });

    if (!resp.ok) {
      let errorMessage = "Upstream error";
      try {
        const errJson = (await resp.json()) as unknown;
        if (errJson && typeof errJson === "object") {
          const maybeError = errJson as { error?: unknown };
          if (
            maybeError.error &&
            typeof maybeError.error === "object" &&
            "message" in maybeError.error
          ) {
            errorMessage = String((maybeError.error as { message?: unknown }).message ?? errorMessage);
          } else {
            errorMessage = JSON.stringify(errJson);
          }
        } else if (typeof errJson === "string") {
          errorMessage = errJson;
        }
      } catch {
        errorMessage = await resp.text();
      }
      console.error("Perplexity API error:", {
        status: resp.status,
        message: errorMessage,
        url: resp.url
      });
      return NextResponse.json({
        error: errorMessage || "Upstream error",
        status: resp.status
      }, { status: resp.status });
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Chat API error:", errorMessage);
    return NextResponse.json({
      error: "Internal server error",
      debug: errorMessage
    }, { status: 500 });
  }
}
