"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Grid,
  Heading,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import type { PaymentSettings } from "@/lib/data/products";

type FormValues = {
  card_number: string;
  card_holder: string;
  bank_name: string;
  instructions_uz: string;
  instructions_ru: string;
  instructions_en: string;
};

function toFormValues(settings: PaymentSettings | null): FormValues {
  return {
    card_number: settings?.card_number ?? "",
    card_holder: settings?.card_holder ?? "",
    bank_name: settings?.bank_name ?? "",
    instructions_uz: settings?.instructions_uz ?? "",
    instructions_ru: settings?.instructions_ru ?? "",
    instructions_en: settings?.instructions_en ?? "",
  };
}

export function SettingsForm({ initialSettings }: { initialSettings: PaymentSettings | null }) {
  const [values, setValues] = useState<FormValues>(() => toFormValues(initialSettings));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box style={{ maxWidth: 720 }}>
      <Heading size="7" mb="5">
        Sozlamalar
      </Heading>

      <Card>
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="4" p="2">
            <Heading size="4">To&apos;lov ma&apos;lumotlari</Heading>
            <Text size="2" color="gray">
              Bu ma&apos;lumotlar checkout sahifasida mijozlarga ko&apos;rsatiladi.
            </Text>

            <Grid columns={{ initial: "1", sm: "2" }} gap="3">
              <Field label="Karta raqami">
                <TextField.Root
                  value={values.card_number}
                  placeholder="8600 0000 0000 0000"
                  onChange={(e) => set("card_number", e.target.value)}
                />
              </Field>
              <Field label="Karta egasi (F.I.Sh)">
                <TextField.Root
                  value={values.card_holder}
                  placeholder="ALIYEV VALI"
                  onChange={(e) => set("card_holder", e.target.value)}
                />
              </Field>
            </Grid>

            <Field label="Bank nomi">
              <TextField.Root
                value={values.bank_name}
                placeholder="Masalan: Xalq banki"
                onChange={(e) => set("bank_name", e.target.value)}
              />
            </Field>

            <Field label="Yo'riqnoma (O'zbekcha)">
              <TextArea
                value={values.instructions_uz}
                onChange={(e) => set("instructions_uz", e.target.value)}
                rows={2}
              />
            </Field>
            <Field label="Yo'riqnoma (Ruscha)">
              <TextArea
                value={values.instructions_ru}
                onChange={(e) => set("instructions_ru", e.target.value)}
                rows={2}
              />
            </Field>
            <Field label="Yo'riqnoma (Inglizcha)">
              <TextArea
                value={values.instructions_en}
                onChange={(e) => set("instructions_en", e.target.value)}
                rows={2}
              />
            </Field>

            {saved && (
              <Callout.Root color="green" size="1">
                <Callout.Icon>
                  <CheckCircledIcon />
                </Callout.Icon>
                <Callout.Text>Sozlamalar saqlandi</Callout.Text>
              </Callout.Root>
            )}

            <Flex justify="end">
              <Button type="submit" size="3" disabled={saving}>
                {saving ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </Flex>
          </Flex>
        </form>
      </Card>
    </Box>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Text as="label" size="2" weight="medium" mb="1" style={{ display: "block" }}>
        {label}
      </Text>
      {children}
    </Box>
  );
}
