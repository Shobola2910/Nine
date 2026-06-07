"use client";

import { useTranslations } from "next-intl";
import { Box, Flex, IconButton, Text } from "@radix-ui/themes";
import { BackpackIcon } from "@radix-ui/react-icons";
import { Link } from "@/lib/i18n/navigation";
import { LangSwitcher } from "./LangSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { useCartStore } from "@/lib/cart/store";
import { useEffect, useState } from "react";

export function Header() {
  const t = useTranslations();
  const totalQuantity = useCartStore((s) => s.totalQuantity());
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <Box
      style={{
        borderBottom: "1px solid var(--gray-a5)",
        position: "sticky",
        top: 0,
        zIndex: 10,
        backdropFilter: "blur(8px)",
        background: "var(--color-panel-translucent)",
      }}
    >
      <Flex
        align="center"
        justify="between"
        py="3"
        px="4"
        className="page-container"
        gap="3"
        wrap="wrap"
      >
        <Link href="/">
          <Text size="5" weight="bold" style={{ letterSpacing: "-0.02em" }}>
            ShopApp
          </Text>
        </Link>

        <Flex align="center" gap="2">
          <Link href="/track">
            <Text size="2" weight="medium">
              {t("nav.track")}
            </Text>
          </Link>

          <Link href="/cart">
            <IconButton variant="soft" radius="full" aria-label={t("nav.cart")}>
              <Box position="relative">
                <BackpackIcon />
                {mounted && totalQuantity > 0 && (
                  <Box
                    style={{
                      position: "absolute",
                      top: -10,
                      right: -10,
                      background: "var(--accent-9)",
                      color: "white",
                      borderRadius: "999px",
                      fontSize: 10,
                      lineHeight: "16px",
                      minWidth: 16,
                      textAlign: "center",
                      padding: "0 3px",
                    }}
                  >
                    {totalQuantity}
                  </Box>
                )}
              </Box>
            </IconButton>
          </Link>

          <LangSwitcher />
          <ThemeToggle label={t("nav.theme")} />
        </Flex>
      </Flex>
    </Box>
  );
}
