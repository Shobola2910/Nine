"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Heading,
  Separator,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { InfoCircledIcon, UploadIcon } from "@radix-ui/react-icons";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { useCartStore } from "@/lib/cart/store";
import { formatPrice } from "@/lib/products";
import { fetchPaymentSettings, type PaymentSettings } from "@/lib/data/products";
import { CheckoutSteps, type StepKey } from "@/components/shop/CheckoutSteps";

function localizedInstructions(settings: PaymentSettings | null, locale: string): string {
  if (!settings) return "";
  if (locale === "ru") return settings.instructions_ru || settings.instructions_uz || "";
  if (locale === "en") return settings.instructions_en || settings.instructions_uz || "";
  return settings.instructions_uz || "";
}

export default function CheckoutPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clearCart = useCartStore((s) => s.clear);

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<StepKey>("details");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [formError, setFormError] = useState("");

  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderError, setOrderError] = useState("");
  const [creatingOrder, setCreatingOrder] = useState(false);

  const [settings, setSettings] = useState<PaymentSettings | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [receiptError, setReceiptError] = useState("");

  useEffect(() => {
    setMounted(true);
    fetchPaymentSettings().then(setSettings);
  }, []);

  if (!mounted) return null;

  if (items.length === 0 && step !== "done") {
    return (
      <Box className="page-container" py="6">
        <Flex direction="column" align="center" gap="4" py="9">
          <Text color="gray">{t("cart.empty")}</Text>
          <Link href="/">
            <Button variant="soft">{t("cart.continueShopping")}</Button>
          </Link>
        </Flex>
      </Box>
    );
  }

  const stepLabels: Record<StepKey, string> = {
    details: t("checkout.stepDetails"),
    payment: t("checkout.stepPayment"),
    receipt: t("checkout.stepReceipt"),
    done: t("checkout.stepDone"),
  };

  async function handleCreateOrder() {
    setFormError("");
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setFormError(t("checkout.missingFields"));
      return;
    }

    setCreatingOrder(true);
    setOrderError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          customerPhone: phone.trim(),
          customerAddress: address.trim(),
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            quantity: i.quantity,
            price: i.price,
          })),
          total: subtotal,
        }),
      });

      if (!res.ok) throw new Error("order_failed");
      const data = await res.json();
      setOrderId(data.orderId as string);
      setStep("payment");
    } catch {
      setOrderError(t("checkout.orderError"));
    } finally {
      setCreatingOrder(false);
    }
  }

  async function handleUploadReceipt() {
    setReceiptError("");
    if (!file) {
      setReceiptError(t("checkout.selectFileFirst"));
      return;
    }
    if (!orderId) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("orderId", orderId);
      formData.append("file", file);

      const res = await fetch("/api/receipts/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("upload_failed");

      clearCart();
      setStep("done");
    } catch {
      setReceiptError(t("checkout.receiptError"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <Box className="page-container" py="6">
      <Heading size="7" mb="5">
        {t("checkout.title")}
      </Heading>

      <CheckoutSteps current={step} labels={stepLabels} />

      <Flex direction={{ initial: "column", md: "row" }} gap="6">
        <Box style={{ flexGrow: 1, maxWidth: 560 }}>
          {step === "details" && (
            <Card>
              <Flex direction="column" gap="3" p="2">
                <Box>
                  <Text as="label" size="2" weight="medium" mb="1" style={{ display: "block" }}>
                    {t("checkout.name")}
                  </Text>
                  <TextField.Root
                    value={name}
                    placeholder={t("checkout.namePlaceholder")}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Box>
                <Box>
                  <Text as="label" size="2" weight="medium" mb="1" style={{ display: "block" }}>
                    {t("checkout.phone")}
                  </Text>
                  <TextField.Root
                    value={phone}
                    placeholder={t("checkout.phonePlaceholder")}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Box>
                <Box>
                  <Text as="label" size="2" weight="medium" mb="1" style={{ display: "block" }}>
                    {t("checkout.address")}
                  </Text>
                  <TextArea
                    value={address}
                    placeholder={t("checkout.addressPlaceholder")}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                  />
                </Box>

                {formError && (
                  <Callout.Root color="red" size="1">
                    <Callout.Icon>
                      <InfoCircledIcon />
                    </Callout.Icon>
                    <Callout.Text>{formError}</Callout.Text>
                  </Callout.Root>
                )}
                {orderError && (
                  <Callout.Root color="red" size="1">
                    <Callout.Icon>
                      <InfoCircledIcon />
                    </Callout.Icon>
                    <Callout.Text>{orderError}</Callout.Text>
                  </Callout.Root>
                )}

                <Button size="3" onClick={handleCreateOrder} disabled={creatingOrder}>
                  {creatingOrder ? t("checkout.creatingOrder") : t("checkout.continue")}
                </Button>
              </Flex>
            </Card>
          )}

          {step === "payment" && (
            <Card>
              <Flex direction="column" gap="3" p="2">
                <Heading size="4">{t("checkout.paymentTitle")}</Heading>
                <Text size="2" color="gray">
                  {t("checkout.paymentInstructions")}
                </Text>

                <Separator size="4" />

                <Flex direction="column" gap="2">
                  <Flex justify="between">
                    <Text size="2" color="gray">
                      {t("checkout.amountToPay")}
                    </Text>
                    <Text weight="bold" size="5" color="indigo">
                      {formatPrice(subtotal, locale, t("common.currency"))}
                    </Text>
                  </Flex>
                  <Flex justify="between">
                    <Text size="2" color="gray">
                      {t("checkout.cardNumber")}
                    </Text>
                    <Text weight="bold" size="4" style={{ letterSpacing: "0.05em" }}>
                      {settings?.card_number || "—"}
                    </Text>
                  </Flex>
                  <Flex justify="between">
                    <Text size="2" color="gray">
                      {t("checkout.cardHolder")}
                    </Text>
                    <Text weight="medium">{settings?.card_holder || "—"}</Text>
                  </Flex>
                  {settings?.bank_name && (
                    <Flex justify="between">
                      <Text size="2" color="gray">
                        {t("checkout.bankName")}
                      </Text>
                      <Text weight="medium">{settings.bank_name}</Text>
                    </Flex>
                  )}
                </Flex>

                {localizedInstructions(settings, locale) && (
                  <Callout.Root size="1" color="indigo">
                    <Callout.Icon>
                      <InfoCircledIcon />
                    </Callout.Icon>
                    <Callout.Text style={{ whiteSpace: "pre-wrap" }}>
                      {localizedInstructions(settings, locale)}
                    </Callout.Text>
                  </Callout.Root>
                )}

                <Button size="3" onClick={() => setStep("receipt")}>
                  {t("checkout.continue")}
                </Button>
              </Flex>
            </Card>
          )}

          {step === "receipt" && (
            <Card>
              <Flex direction="column" gap="3" p="2">
                <Heading size="4">{t("checkout.uploadReceipt")}</Heading>
                <Text size="2" color="gray">
                  {t("checkout.uploadHint")}
                </Text>

                <label htmlFor="receipt-file">
                  <Flex
                    align="center"
                    justify="center"
                    direction="column"
                    gap="2"
                    p="6"
                    style={{
                      border: "1.5px dashed var(--gray-a7)",
                      borderRadius: "var(--radius-3)",
                      cursor: "pointer",
                    }}
                  >
                    <UploadIcon width={24} height={24} />
                    <Text size="2" weight="medium">
                      {file ? file.name : t("checkout.uploadButton")}
                    </Text>
                  </Flex>
                </label>
                <input
                  id="receipt-file"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  style={{ display: "none" }}
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />

                {receiptError && (
                  <Callout.Root color="red" size="1">
                    <Callout.Icon>
                      <InfoCircledIcon />
                    </Callout.Icon>
                    <Callout.Text>{receiptError}</Callout.Text>
                  </Callout.Root>
                )}

                <Button size="3" onClick={handleUploadReceipt} disabled={uploading}>
                  {uploading ? t("checkout.uploading") : t("checkout.submitReceipt")}
                </Button>
              </Flex>
            </Card>
          )}

          {step === "done" && orderId && (
            <Card>
              <Flex direction="column" gap="3" p="2" align="start">
                <Heading size="5">{t("checkout.successTitle")}</Heading>
                <Text color="gray">{t("checkout.successText")}</Text>
                <Box
                  p="3"
                  style={{
                    background: "var(--gray-a3)",
                    borderRadius: "var(--radius-3)",
                    width: "100%",
                  }}
                >
                  <Text size="1" color="gray">
                    {t("checkout.orderId")}
                  </Text>
                  <Text
                    size="3"
                    weight="bold"
                    style={{ display: "block", wordBreak: "break-all", fontFamily: "monospace" }}
                  >
                    {orderId}
                  </Text>
                </Box>
                <Flex gap="3" wrap="wrap">
                  <Link href={{ pathname: "/track", query: { orderId } }}>
                    <Button>{t("checkout.trackOrder")}</Button>
                  </Link>
                  <Link href="/">
                    <Button variant="soft">{t("checkout.backToShop")}</Button>
                  </Link>
                </Flex>
              </Flex>
            </Card>
          )}
        </Box>

        {step !== "done" && (
          <Card style={{ minWidth: 280, height: "fit-content" }}>
            <Flex direction="column" gap="2" p="2">
              <Heading size="4">{t("checkout.orderSummary")}</Heading>
              <Separator size="4" />
              {items.map((item) => (
                <Flex key={item.productId} justify="between" gap="2">
                  <Text size="2" style={{ flex: 1 }} truncate>
                    {item.name} × {item.quantity}
                  </Text>
                  <Text size="2" weight="medium">
                    {formatPrice(item.price * item.quantity, locale, t("common.currency"))}
                  </Text>
                </Flex>
              ))}
              <Separator size="4" />
              <Flex justify="between">
                <Text weight="bold">{t("cart.total")}</Text>
                <Text weight="bold" size="5" color="indigo">
                  {formatPrice(subtotal, locale, t("common.currency"))}
                </Text>
              </Flex>
            </Flex>
          </Card>
        )}
      </Flex>
    </Box>
  );
}
