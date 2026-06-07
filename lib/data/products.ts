import { supabaseBrowser, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Product } from "@/lib/products";

export async function fetchProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabaseBrowser
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchProducts error:", error.message);
    return [];
  }

  return (data ?? []) as Product[];
}

export async function fetchProductById(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabaseBrowser
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("fetchProductById error:", error.message);
    return null;
  }

  return (data ?? null) as Product | null;
}

export type PaymentSettings = {
  card_number: string | null;
  card_holder: string | null;
  bank_name: string | null;
  instructions_uz: string | null;
  instructions_ru: string | null;
  instructions_en: string | null;
};

export async function fetchPaymentSettings(): Promise<PaymentSettings | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabaseBrowser
    .from("settings")
    .select("card_number, card_holder, bank_name, instructions_uz, instructions_ru, instructions_en")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("fetchPaymentSettings error:", error.message);
    return null;
  }

  return (data ?? null) as PaymentSettings | null;
}
