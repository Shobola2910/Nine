"use client";

import { useState } from "react";
import { Box, Heading, Table, Text } from "@radix-ui/themes";
import { AdminOrder, OrderRow } from "./OrderRow";

export function OrdersManager({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);

  async function refreshOrder(orderId: string) {
    const res = await fetch("/api/admin/orders");
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders ?? []);
    }
    return orderId;
  }

  async function handleDecision(
    orderId: string,
    receiptId: string,
    decision: "approved" | "rejected",
    comment: string
  ) {
    const res = await fetch(`/api/admin/receipts/${receiptId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, comment }),
    });
    if (res.ok) await refreshOrder(orderId);
  }

  async function handleStatusChange(orderId: string, status: string) {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  return (
    <Box>
      <Heading size="7" mb="5">
        Buyurtmalar
      </Heading>

      <Box style={{ overflowX: "auto" }}>
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Buyurtma</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Mijoz</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Mahsulotlar</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Summa</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Holat</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Chek</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {orders.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={6}>
                  <Text color="gray">Buyurtmalar mavjud emas</Text>
                </Table.Cell>
              </Table.Row>
            )}
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} onDecision={handleDecision} onStatusChange={handleStatusChange} />
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Box>
  );
}
