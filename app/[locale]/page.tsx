import { getTranslations } from "next-intl/server";
import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import { fetchProducts } from "@/lib/data/products";
import { ProductCard } from "@/components/shop/ProductCard";

export default async function HomePage() {
  const t = await getTranslations("home");
  const products = await fetchProducts();

  return (
    <Box className="page-container" py="6">
      <Flex direction="column" gap="1" mb="5">
        <Heading size="8">{t("title")}</Heading>
        <Text size="3" color="gray">
          {t("subtitle")}
        </Text>
      </Flex>

      {products.length === 0 ? (
        <Flex align="center" justify="center" py="9">
          <Text color="gray">{t("empty")}</Text>
        </Flex>
      ) : (
        <Box className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Box>
      )}
    </Box>
  );
}
