"use client";

import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { clinic } from "@/lib/content";
import { api } from "@/services/api";

const links = [
  ["Home", "/"],
  ["About Us", "/about"],
  ["Treatments", "/treatments"],
  ["Online Consultation", "/online-consultation"],
  ["Contact Us", "/contact"],
];

const social_links = [
  { icon: Linkedin, href: "https://www.linkedin.com/in/dr-deepika-bhardwaj-143b091a1/" },
]

export function Footer() {
  const [visitors, setVisitors] = useState<number | null>(null);

  useEffect(() => {
    api.incrementVisitors()
      .then((data) => {
        setVisitors(data.visitor_count);
      })
      .catch(() => setVisitors(0));
  }, []);

  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold py-2">{clinic.doctor}</h2>
          <p className="mt-2 text-slate-300 py-1">{clinic.credentials}</p>
          <p className="text-slate-300 py-1">{clinic.hospital}</p>
          <p className="text-slate-300 py-1">{clinic.achievement}</p>
          <p className="text-slate-300 py-1">{clinic.formerly}</p>
          <p className="text-slate-300 py-1">{clinic.tagline}</p>
          <p className="mt-4 max-w-md leading-7 text-slate-300">Patient-focused general medicine care for diagnosis, chronic disease support, and preventive health.</p>

          <div className="mt-5 flex gap-3">
            {social_links.map(({ icon: Icon, href }, index) => (
              <a key={index} href={href} target="_blank" aria-label="Social profile" className="rounded-md border border-white/15 p-2 text-slate-200 hover:bg-white/10">
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Quick Links</h3>
          <div className="mt-4 grid gap-3">
            {links.map(([label, href]) => <Link key={href} href={href} className="text-slate-300 hover:text-white">{label}</Link>)}
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Contact Information</h3>
          <div className="mt-4 grid gap-3 text-slate-300">
            <a className="flex gap-2 hover:text-white" href={`tel:${clinic.phone}`}><Phone className="h-4 w-4" /> {clinic.phone}</a>
            <a className="flex gap-2 hover:text-white" href={`mailto:${clinic.email}`}><Mail className="h-4 w-4" /> {clinic.email}</a>
          </div>
          <p className="mt-6 rounded-md bg-white/10 p-3 text-sm font-semibold">Total Website Visitors: {visitors ?? "..."}</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-sm text-slate-400">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2025 Dr. Deepika Bhardwaj. All Rights Reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms-and-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
