import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  const supabase = await createClient();

  if (key) {
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", key)
      .single();

    if (error) {
      return NextResponse.json({ value: null });
    }

    return NextResponse.json({ value: data.value });
  }

  const { data } = await supabase.from("settings").select("*");

  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const { key, value } = await request.json();

  if (!key) {
    return NextResponse.json({ error: "Key is required" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  const { error } = await supabase
    .from("settings")
    .upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
