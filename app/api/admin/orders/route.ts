import { NextResponse } from "next/server";
import { fetchAdminOrders } from "@/lib/data/admin-orders";

export async function GET() {
  const orders = await fetchAdminOrders();
  return NextResponse.json({ orders });
}
