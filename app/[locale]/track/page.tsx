"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Heading,
  Separator,
  Text,
  TextField,
} from "@radix-ui/themes";
import { InfoCircledIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { formatPrice } from "@/lib/products";

type TrackedOrder = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  customer_name: string;
  items: { product_name: string; quantity: number; price: number }[];
  receipt_status: string | null;
};

const STATUS_COLORS: Record<string, "gray" | "amber" | "green" | "red" | "blue"> = {
  pending: "gray",
  payment_uploaded: "amber",
  confirmed: "green",
  rejected: "red",
  shipped: "blue",
};

function TrackContent() {
  const t = useTranslations();
  const locale = useLocale();
  const searchParams = useSearchParams();

  const [orderId, setOrderId] = useState(searchParams.get("orderId") ?? "");
  const [order, setOrder] = useState<TrackedOrder | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  async function search(id: string) {
    if (!id.trim()) return;
    setLoading(true);
    setOrder(undefined);
    try {
      const res = await fetch(`/api/track?orderId=${encodeURIComponent(id.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order ?? null);
      } else {
        setOrder(null);
      }
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const initial = searchParams.get("orderId");
    if (initial) search(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box className="page-container" py="6" style={{ maxWidth: 720 }}>
      <Heading size="7" mb="1">
        {t("track.title")}
      </Heading>
      <Text color="gray" mb="5" style={{ display: "block" }}>
        {t("track.subtitle")}
      </Text>

      <Card mb="5">
        <Flex direction="column" gap="3" p="2">
          <Text as="label" size="2" weight="medium">
            {t("track.orderIdLabel")}
          </Text>
          <Flex gap="2" wrap="wrap">
            <TextField.Root
              style={{ flexGrow: 1, minWidth: 220, fontFamily: "monospace" }}
              placeholder={t("track.orderIdPlaceholder")}
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") search(orderId);
              }}
            />
            <Button onClick={() => search(orderId)} disabled={loading}>
              <MagnifyingGlassIcon />
              {t("track.search")}
            </Button>
          </Flex>
        </Flex>
      </Card>

      {order === null && (
        <Callout.Root color="red">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>{t("track.notFound")}</Callout.Text>
        </Callout.Root>
      )}

      {order && (
        <Card>
          <Flex direction="column" gap="3" p="2">
            <Heading size="4">{t("track.orderInfo")}</Heading>
            <Separator size="4" />

            <Flex justify="between" wrap="wrap" gap="2">
              <Text color="gray">{t("track.status")}</Text>
              <Badge color={STATUS_COLORS[order.status] ?? "gray"} size="2">
                {t(`status.${order.status}` as never)}
              </Badge>
            </Flex>

            {order.receipt_status && (
              <Flex justify="between" wrap="wrap" gap="2">
                <Text color="gray">{t("track.receiptStatus")}</Text>
                <Badge color={STATUS_COLORS[order.receipt_status] ?? "gray"} size="2">
                  {t(`status.${order.receipt_status}` as never)}
                </Badge>
              </Flex>
            )}

            <Flex justify="between" wrap="wrap" gap="2">
              <Text color="gray">{t("track.createdAt")}</Text>
              <Text>{new Date(order.created_at).toLocaleString(locale)}</Text>
            </Flex>

            <Separator size="4" />
            <Text weight="medium">{t("track.items")}</Text>
            {order.items.map((item, idx) => (
              <Flex key={idx} justify="between" gap="2">
                <Text size="2" style={{ flex: 1 }} truncate>
                  {item.product_name} × {item.quantity}
                </Text>
                <Text size="2" weight="medium">
                  {formatPrice(item.price * item.quantity, locale, t("common.currency"))}
                </Text>
              </Flex>
            ))}

            <Separator size="4" />
            <Flex justify="between">
              <Text weight="bold">{t("track.total")}</Text>
              <Text weight="bold" size="5" color="indigo">
                {formatPrice(order.total, locale, t("common.currency"))}
              </Text>
            </Flex>
          </Flex>
        </Card>
      )}
    </Box>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={null}>
      <TrackContent />
    </Suspense>
  );
}
