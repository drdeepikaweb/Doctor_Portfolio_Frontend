import type { Metadata } from "next";
import { ConsultationForm } from "@/features/forms/consultation-form";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Online Consultation",
  description: "Request a secure online consultation and upload prescriptions, reports, or medical records.",
  alternates: { canonical: "/online-consultation" },
};

export default function OnlineConsultationPage() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <SectionHeading
            eyebrow="Online Consultation"
            title="Secure consultation request"
            description="Submit patient details and relevant medical documents. Accepted formats: PDF, JPG, PNG up to 10 MB."
          />
        </div>
        <ConsultationForm />
      </div>
    </section>
  );
}
