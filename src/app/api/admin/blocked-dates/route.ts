import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { BlockedDateInsert } from "@/types/database";

export async function GET() {
  const supabase = await createServiceClient();

  const { data: blockedDates, error } = await supabase
    .from("blocked_dates")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(blockedDates || []);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { date, reason } = body;

  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  const insertData: BlockedDateInsert = {
    date,
    reason: reason || null,
  };

  const { data, error } = await supabase
    .from("blocked_dates")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  const { error } = await supabase.from("blocked_dates").delete().eq("date", date);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}