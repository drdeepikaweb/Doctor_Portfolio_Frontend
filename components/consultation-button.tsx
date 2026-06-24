"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-context";
import { Button } from "@/components/ui/button";

interface ConsultationButtonProps {
  variant?: "default" | "secondary" | "outline" | "outlineLight" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon" | "xl";
  className?: string;
}

export function ConsultationButton({ variant = "default", size = "default", className }: ConsultationButtonProps) {
  const { language } = useLanguage();
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link href="/online-consultation">
        {language === "hi" ? "ऑनलाइन परामर्श बुक करें" : "Request Online Consultation"}
      </Link>
    </Button>
  );
}
