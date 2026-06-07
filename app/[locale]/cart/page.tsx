"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  IconButton,
  Separator,
  Text,
  TextField,
} from "@radix-ui/themes";
import { MinusIcon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { useCartStore } from "@/lib/cart/store";
import { formatPrice } from "@/lib/products";

export default function CartPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <Box className="page-container" py="6">
      <Heading size="7" mb="5">
        {t("cart.title")}
      </Heading>

      {items.length === 0 ? (
        <Flex direction="column" align="center" gap="4" py="9">
          <Text color="gray">{t("cart.empty")}</Text>
          <Link href="/">
            <Button variant="soft">{t("cart.continueShopping")}</Button>
          </Link>
        </Flex>
      ) : (
        <Flex direction={{ initial: "column", md: "row" }} gap="6">
          <Flex direction="column" gap="3" flexGrow="1">
            {items.map((item) => (
              <Card key={item.productId}>
                <Flex align="center" gap="3" wrap="wrap">
                  <Box
                    style={{
                      position: "relative",
                      width: 72,
                      height: 72,
                      borderRadius: "var(--radius-3)",
                      overflow: "hidden",
                      background: "var(--gray-a3)",
                      flexShrink: 0,
                    }}
                  >
                    {item.imageUrl && (
                      <Image src={item.imageUrl} alt={item.name} fill style={{ objectFit: "cover" }} />
                    )}
                  </Box>

                  <Flex direction="column" flexGrow="1" gap="1" minWidth="120px">
                    <Text weight="medium">{item.name}</Text>
                    <Text size="2" color="gray">
                      {formatPrice(item.price, locale, t("common.currency"))}
                    </Text>
                  </Flex>

                  <Flex align="center" gap="2">
                    <IconButton
                      variant="soft"
                      radius="full"
                      size="1"
                      aria-label="-"
                      onClick={() => setQuantity(item.productId, Math.max(1, item.quantity - 1))}
                    >
                      <MinusIcon />
                    </IconButton>
                    <TextField.Root
                      value={String(item.quantity)}
                      onChange={(e) => {
                        const parsed = parseInt(e.target.value, 10);
                        if (Number.isFinite(parsed)) {
                          setQuantity(item.productId, Math.max(1, Math.min(parsed, item.stock || parsed)));
                        }
                      }}
                      style={{ width: 56, textAlign: "center" }}
                    />
                    <IconButton
                      variant="soft"
                      radius="full"
                      size="1"
                      aria-label="+"
                      onClick={() =>
                        setQuantity(item.productId, Math.min(item.quantity + 1, item.stock || item.quantity + 1))
                      }
                    >
                      <PlusIcon />
                    </IconButton>
                  </Flex>

                  <Text weight="bold" style={{ minWidth: 110, textAlign: "right" }}>
                    {formatPrice(item.price * item.quantity, locale, t("common.currency"))}
                  </Text>

                  <IconButton
                    variant="ghost"
                    color="red"
                    aria-label={t("cart.remove")}
                    onClick={() => removeItem(item.productId)}
                  >
                    <TrashIcon />
                  </IconButton>
                </Flex>
              </Card>
            ))}
          </Flex>

          <Card style={{ minWidth: 280, height: "fit-content" }}>
            <Flex direction="column" gap="3" p="2">
              <Heading size="4">{t("cart.subtotal")}</Heading>
              <Separator size="4" />
              <Flex justify="between">
                <Text color="gray">{t("cart.total")}</Text>
                <Text weight="bold" size="5">
                  {formatPrice(subtotal, locale, t("common.currency"))}
                </Text>
              </Flex>
              <Button size="3" onClick={() => router.push("/checkout")}>
                {t("cart.checkout")}
              </Button>
              <Link href="/">
                <Button size="2" variant="soft" style={{ width: "100%" }}>
                  {t("cart.continueShopping")}
                </Button>
              </Link>
            </Flex>
          </Card>
        </Flex>
      )}
    </Box>
  );
}
