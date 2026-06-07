"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
} from "@radix-ui/themes";
import { LockClosedIcon, InfoCircledIcon } from "@radix-ui/react-icons";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Parol noto'g'ri");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Flex align="center" justify="center" style={{ minHeight: "100vh" }} className="page-container">
      <Card style={{ width: 360 }}>
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="4" p="3" align="center">
            <Flex
              align="center"
              justify="center"
              style={{
                width: 48,
                height: 48,
                borderRadius: "999px",
                background: "var(--accent-a4)",
                color: "var(--accent-11)",
              }}
            >
              <LockClosedIcon width={22} height={22} />
            </Flex>
            <Heading size="5">Admin panelga kirish</Heading>

            <Box width="100%">
              <Text as="label" size="2" weight="medium" mb="1" style={{ display: "block" }}>
                Parol
              </Text>
              <TextField.Root
                type="password"
                value={password}
                placeholder="Parolni kiriting"
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </Box>

            {error && (
              <Callout.Root color="red" size="1" style={{ width: "100%" }}>
                <Callout.Icon>
                  <InfoCircledIcon />
                </Callout.Icon>
                <Callout.Text>{error}</Callout.Text>
              </Callout.Root>
            )}

            <Button type="submit" size="3" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Tekshirilmoqda..." : "Kirish"}
            </Button>
          </Flex>
        </form>
      </Card>
    </Flex>
  );
}
