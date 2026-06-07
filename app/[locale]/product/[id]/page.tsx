import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Box, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { Link } from "@/lib/i18n/navigation";
import { fetchProductById } from "@/lib/data/products";
import { localizedDescription, localizedName } from "@/lib/products";
import { AddToCartPanel } from "@/components/shop/AddToCartPanel";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations("product");
  const product = await fetchProductById(id);

  if (!product) {
    notFound();
  }

  const name = localizedName(product, locale);
  const description = localizedDescription(product, locale);

  return (
    <Box className="page-container" py="6">
      <Link href="/">
        <Flex align="center" gap="1" mb="4">
          <ChevronLeftIcon />
          <Text size="2">{t("back")}</Text>
        </Flex>
      </Link>

      <Grid columns={{ initial: "1", sm: "2" }} gap="6">
        <Box
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "1 / 1",
            borderRadius: "var(--radius-4)",
            overflow: "hidden",
            background: "var(--gray-a3)",
          }}
        >
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={name}
              fill
              sizes="(max-width: 600px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
              priority
            />
          ) : (
            <Flex align="center" justify="center" height="100%">
              <Text color="gray">{name}</Text>
            </Flex>
          )}
        </Box>

        <Flex direction="column" gap="4">
          <Heading size="7">{name}</Heading>
          {description && (
            <Text size="3" color="gray" style={{ whiteSpace: "pre-wrap" }}>
              {description}
            </Text>
          )}
          <AddToCartPanel product={product} />
        </Flex>
      </Grid>
    </Box>
  );
}
