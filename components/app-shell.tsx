"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { LanguageProvider } from "@/components/language-context";
import { AnnouncementMarquee } from "@/components/announcement-marquee";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDoctorPanel = pathname.startsWith("/doctor-panel");
  const isHomePage = pathname === "/";

  if (isDoctorPanel) {
    return <main>{children}</main>;
  }

  return (
    <LanguageProvider>
      <Header />
      {isHomePage && <AnnouncementMarquee />}
      <main>{children}</main>
      <Footer />
    </LanguageProvider>
  );
}
