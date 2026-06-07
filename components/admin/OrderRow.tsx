"use client";

import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Dialog,
  Flex,
  Select,
  Table,
  Text,
  TextField,
} from "@radix-ui/themes";
import { ImageIcon } from "@radix-ui/react-icons";
import Image from "next/image";

export type AdminOrderItem = { product_name: string; quantity: number; price: number };
export type AdminOrderReceipt = {
  id: string;
  status: string;
  admin_comment: string | null;
  signedUrl: string | null;
};
export type AdminOrder = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  status: string;
  total: number;
  created_at: string;
  items: AdminOrderItem[];
  receipt: AdminOrderReceipt | null;
};

const STATUS_COLORS: Record<string, "gray" | "amber" | "green" | "red" | "blue"> = {
  pending: "gray",
  payment_uploaded: "amber",
  confirmed: "green",
  rejected: "red",
  shipped: "blue",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Kutilmoqda",
  payment_uploaded: "To'lov tekshirilmoqda",
  confirmed: "Tasdiqlandi",
  rejected: "Rad etildi",
  shipped: "Yetkazilmoqda",
  approved: "Tasdiqlandi",
};

export function OrderRow({
  order,
  onDecision,
  onStatusChange,
}: {
  order: AdminOrder;
  onDecision: (orderId: string, receiptId: string, decision: "approved" | "rejected", comment: string) => Promise<void>;
  onStatusChange: (orderId: string, status: string) => Promise<void>;
}) {
  const [imageOpen, setImageOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleDecision(decision: "approved" | "rejected") {
    if (!order.receipt) return;
    setBusy(true);
    try {
      await onDecision(order.id, order.receipt.id, decision, comment);
      setComment("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Table.Row>
      <Table.Cell>
        <Text size="2" style={{ fontFamily: "monospace" }}>
          {order.id.slice(0, 8)}…
        </Text>
        <Text size="1" color="gray" style={{ display: "block" }}>
          {new Date(order.created_at).toLocaleString("uz-UZ")}
        </Text>
      </Table.Cell>

      <Table.Cell>
        <Text weight="medium">{order.customer_name}</Text>
        <Text size="1" color="gray" style={{ display: "block" }}>
          {order.customer_phone}
        </Text>
      </Table.Cell>

      <Table.Cell>
        <Flex direction="column" gap="1">
          {order.items.map((item, idx) => (
            <Text key={idx} size="1" color="gray">
              {item.product_name} × {item.quantity}
            </Text>
          ))}
        </Flex>
      </Table.Cell>

      <Table.Cell>
        <Text weight="bold">{Number(order.total).toLocaleString("uz-UZ")} so&apos;m</Text>
      </Table.Cell>

      <Table.Cell>
        <Flex direction="column" gap="2">
          <Select.Root value={order.status} onValueChange={(value) => onStatusChange(order.id, value)}>
            <Select.Trigger />
            <Select.Content>
              {Object.entries(STATUS_LABELS)
                .filter(([key]) => key !== "approved")
                .map(([key, label]) => (
                  <Select.Item key={key} value={key}>
                    {label}
                  </Select.Item>
                ))}
            </Select.Content>
          </Select.Root>
        </Flex>
      </Table.Cell>

      <Table.Cell>
        {order.receipt ? (
          <Flex direction="column" gap="2" align="start">
            <Button variant="soft" size="1" onClick={() => setImageOpen(true)}>
              <ImageIcon />
              Chekni ko&apos;rish
            </Button>
            <Badge color={STATUS_COLORS[order.receipt.status] ?? "gray"} variant="soft">
              {STATUS_LABELS[order.receipt.status] ?? order.receipt.status}
            </Badge>

            {order.receipt.status === "pending" && (
              <Flex direction="column" gap="2" style={{ minWidth: 200 }}>
                <TextField.Root
                  size="1"
                  placeholder="Izoh (ixtiyoriy)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Flex gap="2">
                  <Button size="1" color="green" disabled={busy} onClick={() => handleDecision("approved")}>
                    Tasdiqlash
                  </Button>
                  <Button size="1" color="red" variant="soft" disabled={busy} onClick={() => handleDecision("rejected")}>
                    Rad etish
                  </Button>
                </Flex>
              </Flex>
            )}
          </Flex>
        ) : (
          <Text size="1" color="gray">
            Chek yuklanmagan
          </Text>
        )}

        <Dialog.Root open={imageOpen} onOpenChange={setImageOpen}>
          <Dialog.Content maxWidth="520px">
            <Dialog.Title>To&apos;lov cheki</Dialog.Title>
            {order.receipt?.signedUrl ? (
              <Box style={{ position: "relative", width: "100%", aspectRatio: "3 / 4" }}>
                <Image
                  src={order.receipt.signedUrl}
                  alt="Chek"
                  fill
                  style={{ objectFit: "contain", borderRadius: "var(--radius-3)" }}
                />
              </Box>
            ) : (
              <Text color="gray">Rasm topilmadi yoki muddati tugagan. Sahifani yangilang.</Text>
            )}
            <Flex justify="end" mt="3">
              <Dialog.Close>
                <Button variant="soft">Yopish</Button>
              </Dialog.Close>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      </Table.Cell>
    </Table.Row>
  );
}
