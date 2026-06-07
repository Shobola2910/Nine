import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/server";
import type { PaymentSettings } from "@/lib/data/products";
import { SettingsForm } from "@/components/admin/SettingsForm";

async function getSettings(): Promise<PaymentSettings | null> {
  if (!isSupabaseAdminConfigured) return null;
  const { data } = await supabaseAdmin
    .from("settings")
    .select("card_number, card_holder, bank_name, instructions_uz, instructions_ru, instructions_en")
    .eq("id", 1)
    .maybeSingle();
  return (data ?? null) as PaymentSettings | null;
}

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return <SettingsForm initialSettings={settings} />;
}
