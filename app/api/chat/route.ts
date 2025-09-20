import { NextResponse } from "next/server";

// Function to get PPLX API key from AWS Amplify secrets or local environment
function getPPLXApiKey(): string | null {
  // For AWS Amplify hosting, secrets are stored in process.env.secrets as JSON
  if (process.env.secrets) {
    try {
      const secrets = JSON.parse(process.env.secrets);
      if (secrets.PPLX) {
        return secrets.PPLX;
      }
    } catch (error) {
      console.error("Failed to parse secrets JSON:", error);
    }
  }

  // Fallback to environment variables for local development
  return process.env.PPLX || null;
}

export async function POST(req: Request) {
  try {
    const apiKey = getPPLXApiKey();
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
      console.error("Perplexity proxy error", resp.status, errorMessage);
      return NextResponse.json({ error: errorMessage || "Upstream error" }, { status: resp.status });
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
