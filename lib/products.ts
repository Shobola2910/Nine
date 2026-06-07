export type Product = {
  id: string;
  name_uz: string;
  name_ru: string | null;
  name_en: string | null;
  description_uz: string | null;
  description_ru: string | null;
  description_en: string | null;
  price: number;
  image_url: string | null;
  stock: number;
  category: string | null;
  created_at: string;
};

export function localizedName(product: Product, locale: string): string {
  if (locale === "ru") return product.name_ru || product.name_uz;
  if (locale === "en") return product.name_en || product.name_uz;
  return product.name_uz;
}

export function localizedDescription(product: Product, locale: string): string {
  if (locale === "ru") return product.description_ru || product.description_uz || "";
  if (locale === "en") return product.description_en || product.description_uz || "";
  return product.description_uz || "";
}

export function formatPrice(price: number, locale: string, currency: string): string {
  const formatted = new Intl.NumberFormat(locale === "uz" ? "uz-UZ" : locale, {
    maximumFractionDigits: 0,
  }).format(price);
  return `${formatted} ${currency}`;
}
