import type { Metadata } from "next";
import { AppointmentPageForm } from "@/features/forms/appointment-page-form";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Book Appointment",
  description: "Book an appointment with Dr. Deepika Bhardwaj for general medicine care.",
  alternates: { canonical: "/appointment" },
};

export default function AppointmentPage() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <SectionHeading
          eyebrow="Appointment"
          title="Book your clinic visit"
          description="Submit your preferred date and concern. The clinic will confirm availability by phone or email."
        />
        <AppointmentPageForm />
      </div>
    </section>
  );
}
