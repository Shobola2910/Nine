"use client";

import { useTranslations, useLocale } from "next-intl";
import { Box, Button, Card, Flex, Text } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { Product, formatPrice, localizedName } from "@/lib/products";
import { useCartStore } from "@/lib/cart/store";

export function ProductCard({ product }: { product: Product }) {
  const t = useTranslations();
  const locale = useLocale();
  const addItem = useCartStore((s) => s.addItem);
  const name = localizedName(product, locale);

  return (
    <Card size="2">
      <Flex direction="column" gap="2">
        <Link href={`/product/${product.id}`}>
          <Box
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1 / 1",
              borderRadius: "var(--radius-3)",
              overflow: "hidden",
              background: "var(--gray-a3)",
            }}
          >
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={name}
                fill
                sizes="(max-width: 600px) 50vw, 25vw"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <Flex align="center" justify="center" height="100%">
                <Text size="1" color="gray">
                  {name}
                </Text>
              </Flex>
            )}
          </Box>
        </Link>

        <Link href={`/product/${product.id}`}>
          <Text size="3" weight="medium" style={{ display: "block" }} truncate>
            {name}
          </Text>
        </Link>

        <Flex align="center" justify="between" gap="2">
          <Text size="3" weight="bold" color="indigo">
            {formatPrice(product.price, locale, t("common.currency"))}
          </Text>
          <Button
            size="2"
            variant="soft"
            disabled={product.stock <= 0}
            onClick={() =>
              addItem({
                productId: product.id,
                name,
                price: product.price,
                imageUrl: product.image_url,
                stock: product.stock,
              })
            }
          >
            <PlusIcon />
            {t("home.addToCart")}
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
