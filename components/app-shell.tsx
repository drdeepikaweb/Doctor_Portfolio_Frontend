"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDoctorPanel = pathname.startsWith("/doctor-panel");

  if (isDoctorPanel) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
