import type { Metadata } from "next";
import Image from "next/image";
import { Award, BriefcaseMedical, GraduationCap, HeartHandshake, Target } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { clinic } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Dr. Deepika Bhardwaj's qualifications, clinical philosophy, and internal medicine expertise.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-slate-100">
            <Image
              src="https://images.unsplash.com/photo-1659353888906-adb3e39b8635?auto=format&fit=crop&w=900&q=85"
              alt="Dr. Deepika Bhardwaj profile"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <SectionHeading
              eyebrow="About Us"
              title={`${clinic.doctor}, ${clinic.credentials}`}
              description="A general medicine physician focused on comprehensive diagnosis, responsible treatment, and practical preventive health guidance."
            />
            <div className="mt-8 space-y-5 leading-8 text-slate-700">
              <p>
                Dr. Deepika Bhardwaj provides patient-focused internal medicine care for acute symptoms, chronic conditions, and preventive health needs. Her approach combines clinical detail, clear communication, and evidence-based decision making.
              </p>
              <p>
                The clinic supports adults and families with concerns such as diabetes, hypertension, thyroid disorders, respiratory illness, fever, digestive symptoms, lifestyle disorders, and general health consultations.
              </p>
              <p>
                Her medical philosophy is simple: listen carefully, diagnose responsibly, treat ethically, and help patients understand their health enough to participate confidently in care.
              </p>
            </div>
            <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center gap-3">
                <BriefcaseMedical className="h-6 w-6 text-cyan-700" />
                <h2 className="text-xl font-bold text-slate-950">Formerly at</h2>
              </div>
              <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-slate-700">
                <li>LHMC & associated RML Hospital, New Delhi</li>
                <li>General Duty Medical Officer, IIT Roorkee</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 grid gap-5 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-7">
            <Target className="mb-4 h-8 w-8 text-cyan-700" />
            <h2 className="text-2xl font-bold text-slate-950">Mission</h2>
            <p className="mt-3 leading-7 text-slate-700">Provide comprehensive, ethical, and evidence-based healthcare with a strong emphasis on prevention and continuity.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-7">
            <HeartHandshake className="mb-4 h-8 w-8 text-teal-600" />
            <h2 className="text-2xl font-bold text-slate-950">Vision</h2>
            <p className="mt-3 leading-7 text-slate-700">Become a trusted healthcare partner for patients and families through dependable medical guidance and compassionate care.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
