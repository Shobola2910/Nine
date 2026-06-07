# Shop App — onlayn do'kon (admin panel + mijoz katalogi)

Next.js 16 + Radix UI Themes + Supabase asosida qurilgan, 3 tilli (UZ/RU/EN),
Night/Light temali, to'liq moslashuvchan (mobil + desktop) e-tijorat ilovasi.

## Imkoniyatlar

- **Mijoz qismi**: mahsulotlar katalogi, mahsulot tafsiloti, korzinka, ko'p
  bosqichli checkout (ma'lumotlar → to'lov karta raqami → chek skrinshotini
  yuklash → buyurtma raqami), `/track` orqali buyurtma holatini kuzatish.
  Login talab qilinmaydi (guest checkout) — buyurtma noyob ID orqali kuzatiladi.
- **Admin panel** (`/admin`): statik parol bilan kirish, statistik dashboard,
  mahsulotlarni qo'shish/tahrirlash/o'chirish, buyurtmalarni ko'rish va
  holatini o'zgartirish, to'lov cheklarini ko'rib tasdiqlash/rad etish,
  to'lov karta ma'lumotlarini tahrirlash (settings).
- **3 til**: O'zbekcha, Ruscha, Inglizcha (`next-intl`, URL: `/uz`, `/ru`, `/en`)
- **Night/Light tema**: `next-themes` + Radix Theme
- **Responsive**: Radix UI Themes komponentlari asosida, mobil va desktop uchun
  moslashtirilgan grid/flex tartiblar

## Texnologiyalar

Next.js 16 (App Router, Turbopack) · TypeScript · Radix UI Themes ·
next-intl · next-themes · Zustand (korzinka, localStorage) · Supabase
(Postgres + Storage)

---

## 1. Loyihani lokal ishga tushirish

```bash
npm install
npm run dev
```

So'ng brauzerda [http://localhost:3000](http://localhost:3000) ni oching
(avtomatik `/uz` ga yo'naltiradi).

> **Eslatma**: Supabase ulanmagan holatda ham sahifalar ochiladi (bo'sh
> ma'lumot bilan), lekin buyurtma yaratish, chek yuklash va admin CRUD kabi
> DB-bog'liq funksiyalar ishlashi uchun quyidagi 2-bo'limni bajarishingiz kerak.

---

## 2. Supabase loyihasini sozlash

1. [supabase.com](https://supabase.com) saytida ro'yxatdan o'ting va **yangi
   loyiha** yarating.
2. **SQL Editor** bo'limini oching → **New query** → ushbu repodagi
   [`supabase/schema.sql`](supabase/schema.sql) faylining butun mazmunini
   joylashtiring → **Run** tugmasini bosing.
   Bu jadvallarni (`products`, `orders`, `order_items`, `payment_receipts`,
   `settings`), RLS siyosatlarini va boshlang'ich `settings` qatorini yaratadi.
3. **Storage** bo'limiga o'ting va ikkita bucket yarating:
   - `product-images` — **Public bucket** (mahsulot rasmlari uchun)
   - `payment-receipts` — **Private bucket** (mijozlar yuklagan to'lov
     cheklari uchun; admin ularni faqat vaqtinchalik signed URL orqali ko'radi)
4. **Project Settings → API** bo'limidan quyidagi qiymatlarni nusxalang:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` kaliti → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` kaliti (⚠️ **maxfiy**, faqat serverda ishlatiladi) →
     `SUPABASE_SERVICE_ROLE_KEY`

## 3. Muhit o'zgaruvchilari (`.env.local`)

`.env.example` faylidan nusxa ko'chirib `.env.local` yarating va qiymatlarni
to'ldiring:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key

ADMIN_PASSWORD=o'zingiz xohlagan kuchli parol
ADMIN_SESSION_SECRET=istalgan uzun tasodifiy satr (sessiya cookie imzosi uchun)
```

`ADMIN_SESSION_SECRET` uchun, masalan, quyidagicha tasodifiy satr generatsiya
qilishingiz mumkin:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Serverni qayta ishga tushiring (`npm run dev`) — o'zgarishlar kuchga kiradi.

---

## 4. Admin panelga kirish

`/admin/login` sahifasiga o'ting va `.env.local`'dagi `ADMIN_PASSWORD`
qiymatini kiriting. Muvaffaqiyatli kirishdan so'ng `/admin` dashboard ochiladi.

Avval **Sozlamalar** (`/admin/settings`) bo'limida to'lov karta raqami va
boshqa ma'lumotlarni to'ldiring — bu mijozlarga checkout sahifasida
ko'rsatiladi. So'ngra **Mahsulotlar** bo'limidan tovarlarni qo'sha boshlang.

---

## 5. GitHub orqali Vercel'ga deploy qilish

1. Loyihani GitHub'ga push qiling:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main
   ```

2. [vercel.com](https://vercel.com) saytida hisobingizga kiring → **Add New
   → Project** → GitHub repongizni tanlang va import qiling.
3. **Environment Variables** bo'limida `.env.local`'dagi barcha
   o'zgaruvchilarni qo'shing:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
   - `ADMIN_SESSION_SECRET`
4. **Deploy** tugmasini bosing. Bir necha daqiqadan so'ng ilova
   `https://<loyiha-nomi>.vercel.app` manzilida ishga tushadi.

> Kelajakda kodga o'zgartirish kiritib, `main` branch'ga push qilsangiz,
> Vercel avtomatik ravishda qayta deploy qiladi.

---

## 6. Loyiha tuzilishi (qisqacha)

```
app/[locale]/        — mijoz sahifalari (katalog, mahsulot, korzinka, checkout, track)
app/admin/           — admin panel sahifalari (login, dashboard, products, orders, settings)
app/api/             — API route'lar (public va admin)
components/          — UI komponentlar (layout, shop, admin)
lib/                 — Supabase client'lar, korzinka store, i18n, admin auth
messages/            — UZ/RU/EN tarjima fayllari
supabase/schema.sql  — DB sxemasi va RLS siyosatlari
proxy.ts             — i18n routing + admin himoyasi (Next.js 16'da middleware o'rnini bosadi)
```
