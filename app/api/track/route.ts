import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId")?.trim() ?? "";

  if (!UUID_RE.test(orderId)) {
    return NextResponse.json({ order: null });
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("id, status, total, created_at, customer_name")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    return NextResponse.json({ order: null });
  }

  const [{ data: items }, { data: receipts }] = await Promise.all([
    supabaseAdmin
      .from("order_items")
      .select("product_name, quantity, price")
      .eq("order_id", orderId),
    supabaseAdmin
      .from("payment_receipts")
      .select("status")
      .eq("order_id", orderId)
      .order("uploaded_at", { ascending: false })
      .limit(1),
  ]);

  return NextResponse.json({
    order: {
      ...order,
      items: items ?? [],
      receipt_status: receipts?.[0]?.status ?? null,
    },
  });
}
