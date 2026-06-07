"use client";

import { ThemeProvider, useTheme } from "next-themes";
import { Theme } from "@radix-ui/themes";
import { ReactNode } from "react";

function RadixThemeBridge({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  return (
    <Theme
      accentColor="indigo"
      grayColor="slate"
      radius="medium"
      panelBackground="solid"
      appearance={resolvedTheme === "dark" ? "dark" : "light"}
    >
      {children}
    </Theme>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RadixThemeBridge>{children}</RadixThemeBridge>
    </ThemeProvider>
  );
}
