import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const decision = body?.decision;
  const comment = typeof body?.comment === "string" ? body.comment.trim() || null : null;

  if (decision !== "approved" && decision !== "rejected") {
    return NextResponse.json({ error: "invalid_decision" }, { status: 400 });
  }

  const { data: receipt, error: receiptError } = await supabaseAdmin
    .from("payment_receipts")
    .update({ status: decision, admin_comment: comment })
    .eq("id", id)
    .select("order_id")
    .single();

  if (receiptError || !receipt) {
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }

  const orderStatus = decision === "approved" ? "confirmed" : "rejected";
  await supabaseAdmin.from("orders").update({ status: orderStatus }).eq("id", receipt.order_id);

  return NextResponse.json({ ok: true });
}
