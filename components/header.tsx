"use client";

import { Mail, Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AppointmentModal } from "@/features/forms/appointment-modal";
import { clinic } from "@/lib/content";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const nav = [
  ["Home", "/"],
  ["About Us", "/about"],
  ["Treatments", "/treatments"],
  ["Online Consultation", "/online-consultation"],
  ["Contact Us", "/contact"],
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="bg-cyan-800 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 text-sm sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="font-bold">{clinic.doctor}</p>
            <p className="text-cyan-50">{clinic.credentials} | {clinic.tagline}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a className="inline-flex items-center gap-2" href={`mailto:${clinic.email}`}><Mail className="h-4 w-4" /> {clinic.email}</a>
            <a className="inline-flex items-center gap-2" href={`tel:${clinic.phone}`}><Phone className="h-4 w-4" /> {clinic.phone}</a>
            <AppointmentModal trigger={<Button variant="secondary" size="sm">Book Appointment</Button>} />
          </div>
        </div>
      </div>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <Link href="/" className="text-lg font-bold text-cyan-800">{clinic.doctor}</Link>
        <button className="rounded-md p-2 text-slate-700 hover:bg-slate-100 lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <div className="hidden items-center gap-7 lg:flex">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="text-sm font-semibold text-slate-700 hover:text-cyan-700">{label}</Link>
          ))}
        </div>
      </nav>
      <div className={cn("border-t border-slate-200 bg-white lg:hidden", open ? "block" : "hidden")}>
        <div className="grid gap-1 px-4 py-3">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-cyan-50">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
