import { Activity, ClipboardCheck, HeartPulse, ShieldCheck, Stethoscope, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AppointmentModal } from "@/features/forms/appointment-modal";
import { MotionSection } from "@/components/motion-section";
import { SectionHeading } from "@/components/section-heading";
import { TestimonialCarousel } from "@/components/testimonial-carousel";
import { Button } from "@/components/ui/button";
import { treatments } from "@/lib/content";

const highlights = [
  { icon: Stethoscope, title: "Experienced Physician", text: "Broad internal medicine expertise for adults and families." },
  { icon: HeartPulse, title: "Personalized Care", text: "Care plans shaped around symptoms, history, and lifestyle." },
  { icon: ClipboardCheck, title: "Accurate Diagnosis", text: "Evidence-led evaluation with careful follow-up." },
  { icon: ShieldCheck, title: "Ethical Healthcare", text: "Transparent guidance and prevention-first care." },
];

const reasons = [
  "Experienced Physician",
  "Accurate Diagnosis",
  "Personalized Treatment Plans",
  "Preventive Healthcare",
  "Patient-Centric Care",
  "Online Consultation Support",
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-[linear-gradient(115deg,#e6fffb_0%,#f8fafc_42%,#ffffff_100%)]">
        <div className="absolute left-6 top-24 h-20 w-20 rounded-full border border-teal-200/80" />
        <div className="absolute right-12 top-36 hidden h-24 w-24 rounded-full border border-cyan-200 md:block" />
        <div className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <MotionSection className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-4 py-2 text-sm font-semibold text-cyan-800 shadow-sm">
              <Activity className="h-4 w-4" />
              Comprehensive Internal Medicine & Preventive Healthcare
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl font-bold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Compassionate & Comprehensive Internal Medicine Care
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-700">
                Trusted general medicine care focused on accurate diagnosis, personalized treatment, and long-term preventive health.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <AppointmentModal trigger={<Button size="lg">Book Appointment</Button>} />
              <Button asChild variant="outline" size="lg">
                <Link href="/online-consultation">Online Consultation</Link>
              </Button>
            </div>
            <div className="grid max-w-xl grid-cols-3 gap-3 text-center">
              {["MBBS, DNB, MD", "Evidence-Based", "Online Support"].map((item) => (
                <div key={item} className="rounded-md border border-slate-200 bg-white/80 p-3 text-sm font-semibold text-slate-700 shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          </MotionSection>
          <MotionSection delay={0.15} className="relative">
            <div className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-lg bg-cyan-50 shadow-2xl ring-1 ring-cyan-100">
              <Image
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=85"
                alt="Professional female physician in a clinic"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute -bottom-6 left-0 rounded-md bg-white p-4 shadow-xl ring-1 ring-slate-200">
              <p className="text-sm font-semibold text-slate-950">Patient-focused care</p>
              <p className="text-sm text-slate-600">Clinic and online consultations</p>
            </div>
          </MotionSection>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <MotionSection className="relative aspect-[4/5] overflow-hidden rounded-lg bg-slate-100">
            <Image
              src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=900&q=85"
              alt="Doctor reviewing patient health records"
              fill
              className="object-cover"
            />
          </MotionSection>
          <MotionSection delay={0.1} className="space-y-8">
            <SectionHeading
              eyebrow="Welcome"
              title="Welcome to Dr. Deepika Bhardwaj's Clinic"
              description="A modern general medicine practice built around careful listening, ethical treatment, and preventive guidance for everyday and chronic health needs."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {highlights.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-lg border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg">
                  <Icon className="mb-4 h-7 w-7 text-teal-600" />
                  <h3 className="font-semibold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </MotionSection>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Why Choose Us" title="Dependable care for acute, chronic, and preventive health" centered />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map((reason, index) => (
              <MotionSection key={reason} delay={index * 0.04} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <Users className="mb-4 h-7 w-7 text-cyan-700" />
                <h3 className="font-semibold text-slate-950">{reason}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Clear communication, responsible prescriptions, and practical next steps for better outcomes.</p>
              </MotionSection>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Treatments" title="General medicine services and chronic disease support" centered />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {treatments.slice(0, 11).map(({ title, description, icon: Icon }) => (
              <div key={title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg">
                <Icon className="mb-4 h-7 w-7 text-teal-600" />
                <h3 className="font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 min-h-16 text-sm leading-6 text-slate-600">{description}</p>
                <Button asChild variant="link" className="mt-4 px-0">
                  <Link href="/treatments">Learn More</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TestimonialCarousel />

      <section className="bg-cyan-800 py-16 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-100">Need Expert Medical Advice?</p>
            <h2 className="mt-2 text-3xl font-bold">Book a consultation with Dr. Deepika Bhardwaj.</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <AppointmentModal trigger={<Button variant="secondary">Book Appointment</Button>} />
            <Button asChild variant="outlineLight">
              <Link href="/online-consultation">Online Consultation</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
