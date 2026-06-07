-- ShopApp — Supabase ma'lumotlar bazasi sxemasi
-- Ishga tushirish: Supabase Dashboard > SQL Editor > New query > shu faylni joylashtiring > Run

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- 1) Mahsulotlar
-- ─────────────────────────────────────────────────────────────
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name_uz text not null,
  name_ru text,
  name_en text,
  description_uz text,
  description_ru text,
  description_en text,
  price numeric not null check (price >= 0),
  image_url text,
  stock integer not null default 0 check (stock >= 0),
  category text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- 2) Buyurtmalar
-- ─────────────────────────────────────────────────────────────
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_address text,
  status text not null default 'pending'
    check (status in ('pending', 'payment_uploaded', 'confirmed', 'rejected', 'shipped')),
  total numeric not null default 0 check (total >= 0),
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  price numeric not null check (price >= 0)
);

-- ─────────────────────────────────────────────────────────────
-- 3) To'lov cheklari (mijoz yuklagan skrinshotlar)
-- ─────────────────────────────────────────────────────────────
create table if not exists payment_receipts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  image_url text not null, -- Storage'dagi fayl yo'li (masalan: <order_id>/171234.jpg)
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  admin_comment text,
  uploaded_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- 4) Sozlamalar (to'lov karta ma'lumotlari — bitta qator, id=1)
-- ─────────────────────────────────────────────────────────────
create table if not exists settings (
  id integer primary key default 1,
  card_number text,
  card_holder text,
  bank_name text,
  instructions_uz text,
  instructions_ru text,
  instructions_en text,
  constraint settings_singleton check (id = 1)
);

insert into settings (id) values (1)
on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────
-- 5) Row Level Security (RLS)
--
-- Yozish amallari (order yaratish, chek yuklash, admin CRUD) ilovaning
-- server-side API route'lari orqali SUPABASE_SERVICE_ROLE_KEY bilan
-- bajariladi — bu kalit RLS'ni chetlab o'tadi va hech qachon brauzerga
-- yuborilmaydi. Shuning uchun bu yerda faqat PUBLIC O'QISH siyosatlari
-- kerak (mahsulotlar katalogi va to'lov sozlamalari uchun).
-- ─────────────────────────────────────────────────────────────

alter table products enable row level security;
alter table settings enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payment_receipts enable row level security;

drop policy if exists "public read products" on products;
create policy "public read products" on products
  for select using (true);

drop policy if exists "public read settings" on settings;
create policy "public read settings" on settings
  for select using (true);

-- orders / order_items / payment_receipts uchun PUBLIC siyosat
-- yo'q — ularga faqat service role orqali kiriladi (server API route'lar).

-- ─────────────────────────────────────────────────────────────
-- 6) Storage bucket'lar
--
-- Quyidagilarni Supabase Dashboard > Storage bo'limida qo'lda yarating:
--
--   a) "product-images"  — Public bucket (mahsulot rasmlari uchun)
--      Admin mahsulot qo'shganda rasm URL manzilini shu yerga yuklab,
--      ommaviy URL'ni "Rasm manzili (URL)" maydoniga qo'yishi mumkin.
--
--   b) "payment-receipts" — Private bucket (to'lov cheklari uchun)
--      Mijozlar yuklagan skrinshotlar shu yerga saqlanadi. Bucket
--      PRIVATE bo'lishi shart — fayllar faqat admin tomonidan vaqtinchalik
--      "signed URL" orqali ko'riladi (ilova buni avtomatik bajaradi).
--
-- Ikkala bucket uchun ham qo'shimcha Storage policy yozish shart emas,
-- chunki barcha o'qish/yozish amallari service role kaliti orqali
-- (RLS'ni chetlab o'tib) bajariladi.
-- ─────────────────────────────────────────────────────────────
