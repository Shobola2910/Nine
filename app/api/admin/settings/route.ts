import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/server";

export async function PUT(request: Request) {
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const update = {
    card_number: typeof b.card_number === "string" ? b.card_number.trim() || null : null,
    card_holder: typeof b.card_holder === "string" ? b.card_holder.trim() || null : null,
    bank_name: typeof b.bank_name === "string" ? b.bank_name.trim() || null : null,
    instructions_uz: typeof b.instructions_uz === "string" ? b.instructions_uz.trim() || null : null,
    instructions_ru: typeof b.instructions_ru === "string" ? b.instructions_ru.trim() || null : null,
    instructions_en: typeof b.instructions_en === "string" ? b.instructions_en.trim() || null : null,
  };

  const { error } = await supabaseAdmin.from("settings").update(update).eq("id", 1);
  if (error) return NextResponse.json({ error: "update_failed" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
