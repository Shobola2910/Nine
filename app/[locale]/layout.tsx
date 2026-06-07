import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { Flex } from "@radix-ui/themes";
import { routing } from "@/lib/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale}>
      <Flex direction="column" style={{ minHeight: "100vh" }}>
        <Header />
        <Flex asChild flexGrow="1" direction="column">
          <main>{children}</main>
        </Flex>
        <Footer />
      </Flex>
    </NextIntlClientProvider>
  );
}
