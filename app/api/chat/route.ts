import { NextResponse } from "next/server";

// Function to get PPLX API key from either Amplify secrets or environment variables
async function getPPLXApiKey(): Promise<string | null> {
  // Try AWS Amplify secrets first (for production)
  try {
    // Use eval to avoid TypeScript compilation errors when package isn't installed
    const importPath = "@aws-amplify/backend";
    const amplifyBackend = await eval(`import("${importPath}")`).catch(() => null);
    if (amplifyBackend?.secret) {
      const amplifyKey = amplifyBackend.secret("PPLX");
      if (amplifyKey) {
        return amplifyKey;
      }
    }
  } catch {
    // @aws-amplify/backend not available or secret not found, fallback to env vars
  }

  // Fallback to environment variables (for local development)
  return process.env.PPLX || null;
}

export async function POST(req: Request) {
  try {
    const apiKey = await getPPLXApiKey();
    if (!apiKey) {
      console.error("PPLX API key not found in Amplify secrets or environment variables");
      return NextResponse.json({ error: "Missing PPLX API key" }, { status: 500 });
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
        model: "sonar-medium-chat",
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
      console.error("Perplexity proxy error", resp.status, errorMessage);
      return NextResponse.json({ error: errorMessage || "Upstream error" }, { status: resp.status });
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
