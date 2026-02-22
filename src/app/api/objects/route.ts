import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { randomUUID } from "crypto";

// GET /api/objects - list all or get one by id
export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const id = request.nextUrl.searchParams.get("id");

  if (id) {
    const { data, error } = await supabase
      .from("objects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from("objects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/objects - create new object
export async function POST(request: NextRequest) {
  const supabase = createServiceClient();
  const formData = await request.formData();

  const name = formData.get("name") as string;
  const tone = formData.get("tone") as string;
  const knowledge = formData.get("knowledge") as string;
  const suggestedQuestions = JSON.parse(
    (formData.get("suggested_questions") as string) || "[]"
  );

  // Upload images to Supabase Storage
  const imageUrls: string[] = [];
  for (let i = 0; i < 3; i++) {
    const file = formData.get(`image_${i}`) as File | null;
    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${randomUUID()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from("object-images")
        .upload(path, buffer, { contentType: file.type });

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      const { data: urlData } = supabase.storage
        .from("object-images")
        .getPublicUrl(path);

      imageUrls.push(urlData.publicUrl);
    }
  }

  const { data, error } = await supabase
    .from("objects")
    .insert({
      name,
      tone,
      knowledge,
      suggested_questions: suggestedQuestions,
      image_urls: imageUrls,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PUT /api/objects - update object
export async function PUT(request: NextRequest) {
  const supabase = createServiceClient();
  const formData = await request.formData();
  const id = formData.get("id") as string;

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const updates: Record<string, unknown> = {};

  const name = formData.get("name") as string | null;
  if (name) updates.name = name;

  const tone = formData.get("tone") as string | null;
  if (tone !== null) updates.tone = tone;

  const knowledge = formData.get("knowledge") as string | null;
  if (knowledge !== null) updates.knowledge = knowledge;

  const sq = formData.get("suggested_questions") as string | null;
  if (sq) updates.suggested_questions = JSON.parse(sq);

  // Handle new image uploads (only replace if new images provided)
  const newImageUrls: string[] = [];
  let hasNewImages = false;
  for (let i = 0; i < 3; i++) {
    const file = formData.get(`image_${i}`) as File | null;
    if (file && file.size > 0) {
      hasNewImages = true;
      const ext = file.name.split(".").pop();
      const path = `${randomUUID()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from("object-images")
        .upload(path, buffer, { contentType: file.type });

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      const { data: urlData } = supabase.storage
        .from("object-images")
        .getPublicUrl(path);

      newImageUrls.push(urlData.publicUrl);
    } else {
      // Keep existing URL
      const existingUrl = formData.get(`existing_image_${i}`) as string | null;
      if (existingUrl) newImageUrls.push(existingUrl);
    }
  }

  if (hasNewImages || newImageUrls.length > 0) {
    updates.image_urls = newImageUrls;
  }

  const { data, error } = await supabase
    .from("objects")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/objects
export async function DELETE(request: NextRequest) {
  const supabase = createServiceClient();
  const { id } = await request.json();

  const { error } = await supabase.from("objects").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
