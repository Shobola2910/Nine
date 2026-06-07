import { useTranslations } from "next-intl";
import { Box, Flex, Text } from "@radix-ui/themes";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <Box style={{ borderTop: "1px solid var(--gray-a5)", marginTop: "auto" }} py="5">
      <Flex
        direction={{ initial: "column", sm: "row" }}
        align={{ initial: "start", sm: "center" }}
        justify="between"
        gap="2"
        className="page-container"
      >
        <Text size="2" weight="bold">
          ShopApp
        </Text>
        <Text size="2" color="gray">
          {t("tagline")}
        </Text>
        <Text size="1" color="gray">
          © {new Date().getFullYear()} ShopApp — {t("rights")}
        </Text>
      </Flex>
    </Box>
  );
}
