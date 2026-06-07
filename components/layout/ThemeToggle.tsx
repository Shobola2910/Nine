"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { IconButton, Tooltip } from "@radix-ui/themes";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";

export function ThemeToggle({ label }: { label: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <IconButton variant="soft" radius="full" aria-label={label} />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Tooltip content={label}>
      <IconButton
        variant="soft"
        radius="full"
        aria-label={label}
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </IconButton>
    </Tooltip>
  );
}
