"use client";

import { Mail, Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { clinic } from "@/lib/content";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useLanguage } from "./language-context";

const nav = [
  ["Home", "/"],
  ["About Us", "/about"],
  ["Treatments", "/treatments"],
  ["Online Consultation", "/online-consultation"],
  ["Contact Us", "/contact"],
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  return (
    <header className="top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="bg-cyan-800 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex flex-col items-center text-center gap-4 py-1 sm:flex-row sm:items-center sm:text-left">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-white/20 bg-white shadow-md">
              <Image
                src="/images/doc-logo.jpg"
                alt={clinic.doctor}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-extrabold text-xl py-0.5">{clinic.doctor}</p>
              <p className="text-cyan-50 text-lg py-0.5">{clinic.credentials}</p>
              <p className="text-cyan-50 text-lg py-0.5">{clinic.hospital}</p>
              <p className="text-cyan-50 text-lg py-0.5">{clinic.achievement}</p>
            </div>
          </div>
          <div className="flex flex-col gap-6 items-center text-center sm:flex-row sm:items-center sm:text-left lg:gap-8">
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <a className="inline-flex items-center gap-2 text-lg hover:text-cyan-200 transition-colors" href={`mailto:${clinic.email}`}><Mail className="h-4 w-4" /> {clinic.email}</a>
              <a className="inline-flex items-center gap-2 text-lg hover:text-cyan-200 transition-colors" href={`tel:${clinic.phone}`}><Phone className="h-4 w-4" /> {clinic.phone}</a>
              <p className="text-white text-lg">{clinic.tagline}</p>
            </div>
            <div className="flex flex-col items-center gap-4 w-full sm:w-auto">
              <Button asChild variant="secondary" size="xl" className="w-full sm:w-auto text-center shadow-md">
                <Link href="/online-consultation">
                  {language === "hi" ? "ऑनलाइन परामर्श बुक करें" : "Request Online Consultation"}
                </Link>
              </Button>
              <div className="flex items-center gap-1.5 rounded-lg bg-cyan-900/60 p-1.5 border border-cyan-700/50">
                <button
                  onClick={() => setLanguage("en")}
                  className={cn("px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer", language === "en" ? "bg-white text-cyan-900 shadow-sm" : "text-cyan-100 hover:bg-white/10")}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage("hi")}
                  className={cn("px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer", language === "hi" ? "bg-white text-cyan-900 shadow-sm" : "text-cyan-100 hover:bg-white/10")}
                >
                  हिन्दी
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <button className="rounded-md p-2 text-slate-700 hover:bg-slate-100 lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <div className="hidden items-center gap-12 lg:flex">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="text-lg font-semibold text-slate-700 hover:text-cyan-700">{label}</Link>
          ))}
        </div>
      </nav>
      <div className={cn("border-t border-slate-200 bg-white lg:hidden", open ? "block" : "hidden")}>
        <div className="grid gap-1 px-4 py-3">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-lg font-semibold text-slate-700 hover:bg-cyan-50">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
