import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { treatments } from "@/lib/content";

export const metadata: Metadata = {
  title: "Treatments",
  description: "Detailed treatment support for diabetes, hypertension, thyroid, asthma, COPD, fever, digestive disorders, lifestyle conditions, and general consultation.",
  alternates: { canonical: "/treatments" },
};

const sections = ["Treatment Overview", "Symptoms", "Causes", "Diagnosis Process", "Treatment Options", "Prevention Tips"];

export default function TreatmentsPage() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Treatments"
          title="Detailed internal medicine care"
          description="Structured evaluation and treatment plans for common and complex general medicine concerns."
          centered
        />
        <div className="mt-12 space-y-8">
          {treatments.map((treatment) => (
            <article key={treatment.title} className="rounded-lg border border-slate-200 bg-slate-50 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-slate-950">{treatment.title}</h2>
              <div className="mt-4 grid gap-5 ">
                <p className="mt-2 text-lg leading-6 text-slate-600">
                  {treatment.description}
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="outline"><Link href="/online-consultation">Request Online Consultation</Link></Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function copyFor(section: string, treatment: string) {
  const map: Record<string, string> = {
    "Treatment Overview": `Clinical assessment and personalized care planning for ${treatment.toLowerCase()}.`,
    Symptoms: "Review of current symptoms, warning signs, duration, triggers, and related health concerns.",
    Causes: "Identification of lifestyle, infection-related, metabolic, genetic, or environmental contributors.",
    "Diagnosis Process": "History, physical examination, relevant investigations, and follow-up review where needed.",
    "Treatment Options": "Medication guidance, lifestyle advice, monitoring, referrals, and continuity of care.",
    "Prevention Tips": "Practical steps for risk reduction, early detection, nutrition, activity, and timely review.",
  };
  return map[section];
}
