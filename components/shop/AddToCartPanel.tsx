"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Badge, Button, Flex, IconButton, Text, TextField } from "@radix-ui/themes";
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import { Product, formatPrice, localizedName } from "@/lib/products";
import { useCartStore } from "@/lib/cart/store";

export function AddToCartPanel({ product }: { product: Product }) {
  const t = useTranslations();
  const locale = useLocale();
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const name = localizedName(product, locale);
  const inStock = product.stock > 0;

  function clamp(value: number) {
    return Math.max(1, Math.min(value, product.stock || 1));
  }

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        name,
        price: product.price,
        imageUrl: product.image_url,
        stock: product.stock,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <Flex direction="column" gap="4">
      <Flex align="center" gap="2">
        <Badge color={inStock ? "green" : "red"} variant="soft">
          {inStock ? t("product.inStock") : t("product.outOfStock")}
        </Badge>
        {inStock && (
          <Text size="2" color="gray">
            {t("product.stock")}: {product.stock}
          </Text>
        )}
      </Flex>

      <Text size="6" weight="bold" color="indigo">
        {formatPrice(product.price, locale, t("common.currency"))}
      </Text>

      {inStock && (
        <Flex align="center" gap="3">
          <Text size="2" weight="medium">
            {t("product.quantity")}
          </Text>
          <Flex align="center" gap="2">
            <IconButton
              variant="soft"
              radius="full"
              size="2"
              onClick={() => setQuantity((q) => clamp(q - 1))}
              aria-label="-"
            >
              <MinusIcon />
            </IconButton>
            <TextField.Root
              value={String(quantity)}
              onChange={(e) => {
                const parsed = parseInt(e.target.value, 10);
                setQuantity(Number.isFinite(parsed) ? clamp(parsed) : 1);
              }}
              style={{ width: 64, textAlign: "center" }}
            />
            <IconButton
              variant="soft"
              radius="full"
              size="2"
              onClick={() => setQuantity((q) => clamp(q + 1))}
              aria-label="+"
            >
              <PlusIcon />
            </IconButton>
          </Flex>
        </Flex>
      )}

      <Button size="3" disabled={!inStock} onClick={handleAdd}>
        {added ? t("product.added") : t("product.addToCart")}
      </Button>
    </Flex>
  );
}
