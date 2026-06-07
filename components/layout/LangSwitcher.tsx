"use client";

import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { Select } from "@radix-ui/themes";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { routing } from "@/lib/i18n/routing";

const LOCALE_LABELS: Record<string, string> = {
  uz: "O'zbekcha",
  ru: "Русский",
  en: "English",
};

export function LangSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  function handleChange(nextLocale: string) {
    router.replace(
      // @ts-expect-error -- pathname comes from next-intl's typed navigation
      { pathname, params },
      { locale: nextLocale }
    );
  }

  return (
    <Select.Root value={locale} onValueChange={handleChange}>
      <Select.Trigger variant="soft" radius="full" />
      <Select.Content>
        {routing.locales.map((loc) => (
          <Select.Item key={loc} value={loc}>
            {LOCALE_LABELS[loc] ?? loc.toUpperCase()}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}
