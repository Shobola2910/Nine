"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  Flex,
  Grid,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import type { Product } from "@/lib/products";

export type ProductFormValues = {
  name_uz: string;
  name_ru: string;
  name_en: string;
  description_uz: string;
  description_ru: string;
  description_en: string;
  price: string;
  stock: string;
  category: string;
  image_url: string;
};

function toFormValues(product?: Product | null): ProductFormValues {
  return {
    name_uz: product?.name_uz ?? "",
    name_ru: product?.name_ru ?? "",
    name_en: product?.name_en ?? "",
    description_uz: product?.description_uz ?? "",
    description_ru: product?.description_ru ?? "",
    description_en: product?.description_en ?? "",
    price: product ? String(product.price) : "",
    stock: product ? String(product.stock) : "",
    category: product?.category ?? "",
    image_url: product?.image_url ?? "",
  };
}

export function ProductForm({
  open,
  onOpenChange,
  product,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSubmit: (values: ProductFormValues) => Promise<void>;
}) {
  const [values, setValues] = useState<ProductFormValues>(() => toFormValues(product));
  const [saving, setSaving] = useState(false);

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (next) setValues(toFormValues(product));
        onOpenChange(next);
      }}
    >
      <Dialog.Content maxWidth="640px">
        <Dialog.Title>{product ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}</Dialog.Title>

        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="3" mt="3">
            <Grid columns={{ initial: "1", sm: "3" }} gap="3">
              <Field label="Nomi (O'zbekcha)">
                <TextField.Root value={values.name_uz} onChange={(e) => set("name_uz", e.target.value)} required />
              </Field>
              <Field label="Nomi (Ruscha)">
                <TextField.Root value={values.name_ru} onChange={(e) => set("name_ru", e.target.value)} />
              </Field>
              <Field label="Nomi (Inglizcha)">
                <TextField.Root value={values.name_en} onChange={(e) => set("name_en", e.target.value)} />
              </Field>
            </Grid>

            <Grid columns={{ initial: "1", sm: "3" }} gap="3">
              <Field label="Tavsif (O'zbekcha)">
                <TextArea value={values.description_uz} onChange={(e) => set("description_uz", e.target.value)} rows={2} />
              </Field>
              <Field label="Tavsif (Ruscha)">
                <TextArea value={values.description_ru} onChange={(e) => set("description_ru", e.target.value)} rows={2} />
              </Field>
              <Field label="Tavsif (Inglizcha)">
                <TextArea value={values.description_en} onChange={(e) => set("description_en", e.target.value)} rows={2} />
              </Field>
            </Grid>

            <Grid columns={{ initial: "1", sm: "3" }} gap="3">
              <Field label="Narxi (so'm)">
                <TextField.Root
                  type="number"
                  min="0"
                  value={values.price}
                  onChange={(e) => set("price", e.target.value)}
                  required
                />
              </Field>
              <Field label="Ombordagi soni">
                <TextField.Root
                  type="number"
                  min="0"
                  value={values.stock}
                  onChange={(e) => set("stock", e.target.value)}
                  required
                />
              </Field>
              <Field label="Kategoriya">
                <TextField.Root value={values.category} onChange={(e) => set("category", e.target.value)} />
              </Field>
            </Grid>

            <Field label="Rasm manzili (URL)">
              <TextField.Root
                value={values.image_url}
                placeholder="https://..."
                onChange={(e) => set("image_url", e.target.value)}
              />
            </Field>

            <Flex justify="end" gap="3" mt="2">
              <Dialog.Close>
                <Button variant="soft" color="gray" type="button">
                  Bekor qilish
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={saving}>
                {saving ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </Flex>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
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
