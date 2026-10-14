import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ENDPOINT = "https://bot.plunderandriffle.com/api/mcp";
const TOOLS = ["get_account", "create_audioscript", "get_audioscript_status", "create_before_pitch", "request_mp4", "get_mp4_status"] as const;

const input = z.object({
  apiKey: z.string().trim().min(8).max(500),
  tool: z.enum(TOOLS),
  args: z.record(z.string(), z.union([z.string().max(3000), z.number(), z.boolean()])).default({}),
});

export type EngineResult = { ok: true; data: Record<string, unknown> } | { ok: false; error: string };

export const callMinuteEngine = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => input.parse(data))
  .handler(async ({ data }): Promise<EngineResult> => {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", Authorization: `Bearer ${data.apiKey}` },
        body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method: "tools/call", params: { name: data.tool, arguments: data.args } }),
      });
      const raw = await res.text();
      const jsonText = raw.trim().startsWith("{") ? raw : (raw.split("\n").find(l => l.startsWith("data:"))?.slice(5) ?? "{}");
      const body = JSON.parse(jsonText) as { error?: { message?: string }; result?: { isError?: boolean; content?: { type: string; text?: string }[] } };
      if (body.error) return { ok: false, error: body.error.message ?? "The video service refused the request." };
      const text = body.result?.content?.find(c => c.type === "text")?.text ?? "";
      let parsed: Record<string, unknown>;
      try { parsed = JSON.parse(text) as Record<string, unknown>; } catch { parsed = { message: text }; }
      if (body.result?.isError) return { ok: false, error: String(parsed["error"] ?? parsed["message"] ?? "Something went wrong.") };
      return { ok: true, data: parsed };
    } catch (error) {
      console.error(error);
      return { ok: false, error: "Couldn’t reach the video service. Try again in a moment." };
    }
  });
