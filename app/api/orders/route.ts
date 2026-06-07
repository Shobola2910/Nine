import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/server";

type OrderItemInput = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
};

export async function POST(request: Request) {
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { customerName, customerPhone, customerAddress, items, total } = body as {
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
    items?: OrderItemInput[];
    total?: number;
  };

  if (
    !customerName?.trim() ||
    !customerPhone?.trim() ||
    !Array.isArray(items) ||
    items.length === 0 ||
    typeof total !== "number"
  ) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_address: customerAddress?.trim() ?? null,
      total,
      status: "pending",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "order_insert_failed" }, { status: 500 });
  }

  const itemRows = items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    product_name: item.name,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabaseAdmin.from("order_items").insert(itemRows);

  if (itemsError) {
    return NextResponse.json({ error: "order_items_insert_failed" }, { status: 500 });
  }

  return NextResponse.json({ orderId: order.id });
}
