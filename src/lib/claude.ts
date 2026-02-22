import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function identifyObject(
  userImageBase64: string,
  userImageMediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif",
  objects: { id: string; name: string; knowledge: string }[]
): Promise<{ id: string; name: string } | null> {
  // 登録済みオブジェクトのリストをテキストで作成
  const objectList = objects
    .map((obj) => `- ID: ${obj.id} / 名前: ${obj.name} / 説明: ${obj.knowledge.slice(0, 100)}`)
    .join("\n");

  const content: Anthropic.MessageCreateParams["messages"][0]["content"] = [
    {
      type: "image",
      source: { type: "base64", media_type: userImageMediaType, data: userImageBase64 },
    },
    {
      type: "text",
      text: `この写真に写っている物体を特定してください。

以下は登録済みの立体物のリストです:
${objectList}

この写真に最も一致する立体物のIDと名前をJSON形式で返してください。
一致するものがない場合は null を返してください。
フォーマット: {"id": "xxx", "name": "xxx"} または null
JSONのみを返し、他のテキストは含めないでください。`,
    },
  ];

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 256,
      messages: [{ role: "user", content }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text.trim() : "";
    console.log("Claude identify response:", text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      if (text === "null" || text.includes("null")) return null;
      return null;
    }

    const result = JSON.parse(jsonMatch[0]);
    if (result && result.id && result.name) {
      return { id: result.id, name: result.name };
    }
    return null;
  } catch (e) {
    console.error("identifyObject error:", e);
    return null;
  }
}

export function buildSystemPrompt(
  objectName: string,
  tone: string,
  knowledge: string,
  searchResults?: string
): string {
  let prompt = `あなたは「${objectName}」という立体物（展示物）です。以下の設定に従って、この立体物になりきって来館者と会話してください。

## キャラクター設定・トンマナ
${tone}

## この立体物に関する情報・ナレッジ
${knowledge}`;

  if (searchResults) {
    prompt += `\n\n## 追加の検索結果（参考情報）
${searchResults}`;
  }

  prompt += `\n\n## 会話ルール
- 常にこの立体物の視点・人格で会話してください
- ナレッジにある情報を優先して回答してください
- わからないことは正直に「それは知らないなぁ」と答えてください
- 親しみやすく、来館者が楽しめる会話を心がけてください`;

  return prompt;
}

export { anthropic };
