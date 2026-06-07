import { Box, Card, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { ArchiveIcon, ListBulletIcon, ClockIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/server";

async function getStats() {
  if (!isSupabaseAdminConfigured) {
    return { products: 0, orders: 0, pendingReceipts: 0, confirmedOrders: 0 };
  }

  const [products, orders, pendingReceipts, confirmedOrders] = await Promise.all([
    supabaseAdmin.from("products").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("orders").select("id", { count: "exact", head: true }),
    supabaseAdmin
      .from("payment_receipts")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabaseAdmin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "confirmed"),
  ]);

  return {
    products: products.count ?? 0,
    orders: orders.count ?? 0,
    pendingReceipts: pendingReceipts.count ?? 0,
    confirmedOrders: confirmedOrders.count ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Mahsulotlar soni", value: stats.products, icon: ArchiveIcon, color: "indigo" as const },
    { label: "Buyurtmalar soni", value: stats.orders, icon: ListBulletIcon, color: "blue" as const },
    { label: "Tekshiruv kutilmoqda", value: stats.pendingReceipts, icon: ClockIcon, color: "amber" as const },
    { label: "Tasdiqlangan buyurtmalar", value: stats.confirmedOrders, icon: CheckCircledIcon, color: "green" as const },
  ];

  return (
    <Box>
      <Heading size="7" mb="5">
        Boshqaruv paneli
      </Heading>

      {!isSupabaseAdminConfigured && (
        <Card mb="5" style={{ borderLeft: "3px solid var(--amber-9)" }}>
          <Text size="2" color="amber">
            Supabase ulanmagan — .env.local faylida NEXT_PUBLIC_SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_ANON_KEY va SUPABASE_SERVICE_ROLE_KEY qiymatlarini kiriting.
          </Text>
        </Card>
      )}

      <Grid columns={{ initial: "1", xs: "2", lg: "4" }} gap="4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <Flex direction="column" gap="3" p="2">
              <Flex
                align="center"
                justify="center"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--radius-3)",
                  background: `var(--${color}-a4)`,
                  color: `var(--${color}-11)`,
                }}
              >
                <Icon width={20} height={20} />
              </Flex>
              <Text size="2" color="gray">
                {label}
              </Text>
              <Text size="7" weight="bold">
                {value}
              </Text>
            </Flex>
          </Card>
        ))}
      </Grid>
    </Box>
  );
}
