import { Flex } from "@radix-ui/themes";
import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex direction={{ initial: "column", md: "row" }} style={{ minHeight: "100vh" }}>
      <AdminNav />
      <Flex direction="column" flexGrow="1" p="5" style={{ maxWidth: "100%", overflowX: "auto" }}>
        {children}
      </Flex>
    </Flex>
  );
}
