import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { identifyObject } from "@/lib/claude";

export async function POST(request: NextRequest) {
  const supabase = createServiceClient();

  const { image, mediaType } = await request.json();

  if (!image || !mediaType) {
    return NextResponse.json(
      { error: "image (base64) and mediaType are required" },
      { status: 400 }
    );
  }

  // Fetch all registered objects
  const { data: objects, error } = await supabase
    .from("objects")
    .select("id, name, image_urls");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!objects || objects.length === 0) {
    return NextResponse.json(
      { error: "登録された立体物がありません" },
      { status: 404 }
    );
  }

  // Use Claude Vision to identify the object
  try {
    const result = await identifyObject(image, mediaType, objects);

    if (!result) {
      return NextResponse.json(
        { error: "一致する立体物が見つかりませんでした" },
        { status: 404 }
      );
    }

    // Fetch full object data
    const { data: fullObject } = await supabase
      .from("objects")
      .select("*")
      .eq("id", result.id)
      .single();

    return NextResponse.json(fullObject);
  } catch (e) {
    console.error("Identify API error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "認識処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
