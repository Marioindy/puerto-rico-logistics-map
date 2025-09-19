import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.PPLX;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing PPLX API key" }, { status: 500 });
    }

    const { messages } = (await req.json()) as {
      messages: { role: "system" | "user" | "assistant"; content: string }[];
    };

    const resp = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
      const text = await resp.text();
      return NextResponse.json({ error: text || "Upstream error" }, { status: 500 });
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 });
  }
}
