import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  const includeInactive = searchParams.get("includeInactive") === "true";

  const supabase = await createClient();

  let query = supabase.from("services").select("*").order("name");

  if (!includeInactive) {
    query = query.eq("active", true);
  }

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data: services, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(services);
}

export async function POST(request: Request) {
  const body = await request.json();
  const {
    name,
    description,
    features,
    price,
    duration_minutes,
    category_id,
    paystack_link,
    popular,
  } = body;

  if (!name || !description || !category_id) {
    return NextResponse.json(
      { error: "Name, description, and category are required" },
      { status: 400 }
    );
  }

  const supabase = await createServiceClient();

  const id = name.toLowerCase().replace(/\s+/g, "-");

  const { data, error } = await supabase
    .from("services")
    .insert({
      id,
      name,
      description,
      features: features || [],
      price: price || 0,
      duration_minutes: duration_minutes || 60,
      category_id,
      paystack_link: paystack_link || "",
      popular: popular || false,
      active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}