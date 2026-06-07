"use client";

import { usePathname, useRouter } from "next/navigation";
import NextLink from "next/link";
import { Box, Button, Flex, Text } from "@radix-ui/themes";
import {
  DashboardIcon,
  ArchiveIcon,
  ListBulletIcon,
  GearIcon,
  ExitIcon,
  ExternalLinkIcon,
} from "@radix-ui/react-icons";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const NAV_ITEMS = [
  { href: "/admin", label: "Boshqaruv paneli", icon: DashboardIcon, exact: true },
  { href: "/admin/products", label: "Mahsulotlar", icon: ArchiveIcon },
  { href: "/admin/orders", label: "Buyurtmalar", icon: ListBulletIcon },
  { href: "/admin/settings", label: "Sozlamalar", icon: GearIcon },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <Flex
      direction={{ initial: "row", md: "column" }}
      gap="2"
      p="3"
      style={{
        borderRight: "1px solid var(--gray-a5)",
        minWidth: 220,
        height: "100%",
      }}
    >
      <Text size="5" weight="bold" mb="3" style={{ display: "none" }}>
        Admin
      </Text>

      <Flex direction={{ initial: "row", md: "column" }} gap="1" flexGrow="1" wrap="wrap">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <NextLink key={href} href={href} style={{ textDecoration: "none" }}>
              <Flex
                align="center"
                gap="2"
                px="3"
                py="2"
                style={{
                  borderRadius: "var(--radius-3)",
                  background: active ? "var(--accent-a4)" : "transparent",
                  color: active ? "var(--accent-11)" : "var(--gray-12)",
                  fontWeight: active ? 600 : 400,
                }}
              >
                <Icon />
                <Text size="2">{label}</Text>
              </Flex>
            </NextLink>
          );
        })}
      </Flex>

      <Flex direction={{ initial: "row", md: "column" }} gap="2" align={{ initial: "center", md: "stretch" }}>
        <NextLink href="/uz" target="_blank" style={{ textDecoration: "none" }}>
          <Button variant="soft" size="2" style={{ width: "100%" }}>
            <ExternalLinkIcon />
            Saytni ko'rish
          </Button>
        </NextLink>
        <Box>
          <ThemeToggle label="Tema" />
        </Box>
        <Button variant="soft" color="red" size="2" onClick={handleLogout}>
          <ExitIcon />
          Chiqish
        </Button>
      </Flex>
    </Flex>
  );
}
