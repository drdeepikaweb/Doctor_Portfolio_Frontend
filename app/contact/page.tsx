import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/features/forms/contact-form";
import { SectionHeading } from "@/components/section-heading";
import { clinic } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Dr. Deepika Bhardwaj's clinic by phone, email, contact form, or Google Maps.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(clinic.mapQuery)}&output=embed`;

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="" title="Contact Us" centered />
        <div className="mt-12 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            {[
              { icon: Phone, title: "Phone Number", text: clinic.phone },
              { icon: Mail, title: "Email", text: clinic.email },
              // { icon: MapPin, title: "Clinic Address", text: clinic.address },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <Icon className="mb-3 h-6 w-6 text-cyan-700" />
                <h2 className="font-semibold text-slate-950">{title}</h2>
                <p className="mt-1 text-slate-700">{text}</p>
              </div>
            ))}
            {/* <iframe
              title="Clinic Google Map"
              src={mapSrc}
              className="h-80 w-full rounded-lg border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            /> */}
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
