import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/server";

const VALID_STATUSES = ["pending", "payment_uploaded", "confirmed", "rejected", "shipped"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const status = typeof body?.status === "string" ? body.status : "";

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("orders").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: "update_failed" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
