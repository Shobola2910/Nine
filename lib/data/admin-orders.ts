import "server-only";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/server";
import type { AdminOrder } from "@/components/admin/OrderRow";

const RECEIPT_BUCKET = "payment-receipts";
const SIGNED_URL_TTL_SECONDS = 60 * 10;

export async function fetchAdminOrders(): Promise<AdminOrder[]> {
  if (!isSupabaseAdminConfigured) return [];

  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !orders) return [];

  const orderIds = orders.map((o) => o.id);
  if (orderIds.length === 0) return [];

  const [{ data: items }, { data: receipts }] = await Promise.all([
    supabaseAdmin.from("order_items").select("*").in("order_id", orderIds),
    supabaseAdmin
      .from("payment_receipts")
      .select("*")
      .in("order_id", orderIds)
      .order("uploaded_at", { ascending: false }),
  ]);

  const latestReceiptByOrder = new Map<string, NonNullable<typeof receipts>[number]>();
  for (const receipt of receipts ?? []) {
    if (!latestReceiptByOrder.has(receipt.order_id)) {
      latestReceiptByOrder.set(receipt.order_id, receipt);
    }
  }

  const result = await Promise.all(
    orders.map(async (order) => {
      const orderItems = (items ?? []).filter((i) => i.order_id === order.id);
      const receipt = latestReceiptByOrder.get(order.id) ?? null;

      let signedUrl: string | null = null;
      if (receipt?.image_url) {
        const { data: signed } = await supabaseAdmin.storage
          .from(RECEIPT_BUCKET)
          .createSignedUrl(receipt.image_url, SIGNED_URL_TTL_SECONDS);
        signedUrl = signed?.signedUrl ?? null;
      }

      return {
        ...order,
        items: orderItems,
        receipt: receipt
          ? { id: receipt.id, status: receipt.status, admin_comment: receipt.admin_comment, signedUrl }
          : null,
      } as AdminOrder;
    })
  );

  return result;
}
