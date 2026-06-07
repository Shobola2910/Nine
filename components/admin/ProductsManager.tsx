"use client";

import { useState } from "react";
import {
  AlertDialog,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Table,
  Text,
} from "@radix-ui/themes";
import { Pencil1Icon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import type { Product } from "@/lib/products";
import { ProductForm, type ProductFormValues } from "./ProductForm";

function toPayload(values: ProductFormValues) {
  return {
    name_uz: values.name_uz,
    name_ru: values.name_ru,
    name_en: values.name_en,
    description_uz: values.description_uz,
    description_ru: values.description_ru,
    description_en: values.description_en,
    price: Number(values.price),
    stock: Number(values.stock),
    category: values.category,
    image_url: values.image_url,
  };
}

export function ProductsManager({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setFormOpen(true);
  }

  async function handleSubmit(values: ProductFormValues) {
    const payload = toPayload(values);

    if (editing) {
      const res = await fetch(`/api/admin/products/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setProducts((prev) => prev.map((p) => (p.id === editing.id ? data.product : p)));
      }
    } else {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setProducts((prev) => [data.product, ...prev]);
      }
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    const res = await fetch(`/api/admin/products/${deleting.id}`, { method: "DELETE" });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== deleting.id));
    }
    setDeleting(null);
  }

  return (
    <Box>
      <Flex align="center" justify="between" mb="5" wrap="wrap" gap="3">
        <Heading size="7">Mahsulotlar</Heading>
        <Button onClick={openCreate}>
          <PlusIcon />
          Yangi mahsulot qo&apos;shish
        </Button>
      </Flex>

      <Box style={{ overflowX: "auto" }}>
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Rasm</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Nomi</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Narxi</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Ombor</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Amallar</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {products.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={5}>
                  <Text color="gray">Mahsulotlar mavjud emas</Text>
                </Table.Cell>
              </Table.Row>
            )}
            {products.map((product) => (
              <Table.Row key={product.id}>
                <Table.Cell>
                  <Box
                    style={{
                      position: "relative",
                      width: 48,
                      height: 48,
                      borderRadius: "var(--radius-2)",
                      overflow: "hidden",
                      background: "var(--gray-a3)",
                    }}
                  >
                    {product.image_url && (
                      <Image src={product.image_url} alt={product.name_uz} fill style={{ objectFit: "cover" }} />
                    )}
                  </Box>
                </Table.Cell>
                <Table.Cell>
                  <Text weight="medium">{product.name_uz}</Text>
                  {product.category && (
                    <Text size="1" color="gray" style={{ display: "block" }}>
                      {product.category}
                    </Text>
                  )}
                </Table.Cell>
                <Table.Cell>{Number(product.price).toLocaleString("uz-UZ")} so&apos;m</Table.Cell>
                <Table.Cell>
                  <Badge color={product.stock > 0 ? "green" : "red"} variant="soft">
                    {product.stock}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Flex gap="2">
                    <IconButton variant="soft" aria-label="Tahrirlash" onClick={() => openEdit(product)}>
                      <Pencil1Icon />
                    </IconButton>
                    <IconButton variant="soft" color="red" aria-label="O'chirish" onClick={() => setDeleting(product)}>
                      <TrashIcon />
                    </IconButton>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      <ProductForm open={formOpen} onOpenChange={setFormOpen} product={editing} onSubmit={handleSubmit} />

      <AlertDialog.Root open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialog.Content maxWidth="420px">
          <AlertDialog.Title>Mahsulotni o&apos;chirish</AlertDialog.Title>
          <AlertDialog.Description size="2">
            Haqiqatan ham &quot;{deleting?.name_uz}&quot; mahsulotini o&apos;chirmoqchimisiz? Bu amalni qaytarib
            bo&apos;lmaydi.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                Bekor qilish
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button color="red" onClick={handleDelete}>
                O&apos;chirish
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Box>
  );
}
