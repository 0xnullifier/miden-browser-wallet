"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ position = "top-right", ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          // Custom background: white background with dark text
          "--normal-bg": "hsl(0 0% 100%)",
          "--normal-text": "hsl(0 0% 0%)",
          "--normal-border": "var(--border)",
          // Success toast with primary gradient
          "--success-bg": `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))`,
          "--success-text": "hsl(var(--primary-foreground))",
          "--success-border": "hsl(var(--primary))",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
