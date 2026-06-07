import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/server";
import type { Product } from "@/lib/products";
import { ProductsManager } from "@/components/admin/ProductsManager";

async function getProducts(): Promise<Product[]> {
  if (!isSupabaseAdminConfigured) return [];
  const { data } = await supabaseAdmin.from("products").select("*").order("created_at", { ascending: false });
  return (data ?? []) as Product[];
}

export default async function AdminProductsPage() {
  const products = await getProducts();
  return <ProductsManager initialProducts={products} />;
}
