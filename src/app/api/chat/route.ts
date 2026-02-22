import { NextRequest } from "next/server";
import { anthropic, buildSystemPrompt } from "@/lib/claude";
import { searchGoogle } from "@/lib/google-search";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { messages, objectName, tone, knowledge, searchQuery } =
    await request.json();

  // If searchQuery is provided, search Google for additional context
  let searchResults: string | undefined;
  if (searchQuery) {
    searchResults = await searchGoogle(`${objectName} ${searchQuery}`);
  }

  const systemPrompt = buildSystemPrompt(objectName, tone, knowledge, searchResults);

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map(
      (m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })
    ),
  });

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
          );
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
