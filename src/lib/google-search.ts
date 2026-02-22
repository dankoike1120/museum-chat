export async function searchGoogle(query: string): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const engineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !engineId) {
    return "";
  }

  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("cx", engineId);
  url.searchParams.set("q", query);
  url.searchParams.set("num", "3");

  try {
    const res = await fetch(url.toString());
    if (!res.ok) return "";

    const data = await res.json();
    const items = data.items || [];

    return items
      .map(
        (item: { title: string; snippet: string; link: string }) =>
          `- ${item.title}: ${item.snippet} (${item.link})`
      )
      .join("\n");
  } catch {
    return "";
  }
}
