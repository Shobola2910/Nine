import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/server";

type ProductInput = {
  name_uz: string;
  name_ru?: string | null;
  name_en?: string | null;
  description_uz?: string | null;
  description_ru?: string | null;
  description_en?: string | null;
  price: number;
  image_url?: string | null;
  stock: number;
  category?: string | null;
};

function validate(body: unknown): ProductInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.name_uz !== "string" || !b.name_uz.trim()) return null;
  if (typeof b.price !== "number" || b.price < 0) return null;
  if (typeof b.stock !== "number" || b.stock < 0) return null;

  return {
    name_uz: b.name_uz.trim(),
    name_ru: typeof b.name_ru === "string" ? b.name_ru.trim() || null : null,
    name_en: typeof b.name_en === "string" ? b.name_en.trim() || null : null,
    description_uz: typeof b.description_uz === "string" ? b.description_uz.trim() || null : null,
    description_ru: typeof b.description_ru === "string" ? b.description_ru.trim() || null : null,
    description_en: typeof b.description_en === "string" ? b.description_en.trim() || null : null,
    price: b.price,
    image_url: typeof b.image_url === "string" ? b.image_url.trim() || null : null,
    stock: b.stock,
    category: typeof b.category === "string" ? b.category.trim() || null : null,
  };
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const input = validate(body);
  if (!input) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("products")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: "update_failed" }, { status: 500 });
  return NextResponse.json({ product: data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }
  const { id } = await params;

  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "delete_failed" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
