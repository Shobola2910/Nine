import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/server";

const BUCKET = "payment-receipts";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "invalid_form" }, { status: 400 });
  }

  const orderId = formData.get("orderId");
  const file = formData.get("file");

  if (typeof orderId !== "string" || !orderId.trim() || !(file instanceof File)) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "invalid_file_type" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "file_too_large" }, { status: 400 });
  }

  const { data: order, error: orderLookupError } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("id", orderId)
    .maybeSingle();

  if (orderLookupError || !order) {
    return NextResponse.json({ error: "order_not_found" }, { status: 404 });
  }

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${orderId}/${Date.now()}.${extension}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }

  const { error: receiptError } = await supabaseAdmin.from("payment_receipts").insert({
    order_id: orderId,
    image_url: path,
    status: "pending",
  });

  if (receiptError) {
    return NextResponse.json({ error: "receipt_insert_failed" }, { status: 500 });
  }

  await supabaseAdmin.from("orders").update({ status: "payment_uploaded" }).eq("id", orderId);

  return NextResponse.json({ ok: true });
}
