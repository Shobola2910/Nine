import { fetchAdminOrders } from "@/lib/data/admin-orders";
import { OrdersManager } from "@/components/admin/OrdersManager";

export default async function AdminOrdersPage() {
  const orders = await fetchAdminOrders();
  return <OrdersManager initialOrders={orders} />;
}
