"use client";

import Link from "next/link";
import { clinic } from "@/lib/content";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
  return (
    <section className="bg-slate-50 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:text-cyan-800 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xl">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
            <div className="rounded-xl bg-cyan-50 p-3 text-cyan-700">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
              <p className="text-sm text-slate-500 font-semibold mt-0.5">Last updated: June 2026</p>
            </div>
          </div>

          <div className="mt-8 space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">1. Introduction</h2>
              <p>
                Welcome to the Teleconsultation platform of <strong>{clinic.doctor}</strong>. We value your privacy and are committed to protecting your personal and medical information. This Privacy Policy details how we collect, use, store, and safeguard the data you provide when using our services.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">2. Information We Collect</h2>
              <p>When you book an online consultation, we collect the following information:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Personal Details:</strong> Name, Age, Gender, Address.</li>
                <li><strong>Contact Details:</strong> WhatsApp Phone Number, Email Address.</li>
                <li><strong>Medical Information:</strong> Previous prescriptions, medical reports, scan reports, and description of symptoms.</li>
                <li><strong>Identification Proof:</strong> Aadhaar number or Student ID card (specifically for IIT Roorkee students requesting discounted rates).</li>
                <li><strong>Payment Transaction details:</strong> Transaction IDs generated through our secure payment gateway partner.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">3. How We Use Your Information</h2>
              <p>The collected information is used solely for the following purposes:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>To schedule and conduct secure teleconsultations with {clinic.doctor}.</li>
                <li>To maintain medical history and patient records for accurate diagnosis and clinical decision-making.</li>
                <li>To send booking confirmation messages, links, and transaction receipts via WhatsApp or email.</li>
                <li>To verify eligibility for discount categories (e.g., IITR student verification).</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">4. Information Security & Storage</h2>
              <p>
                All medical reports and identification documents are securely uploaded and stored in private object storage directories. Access to patient data is strictly restricted to authorized clinic staff only. We do not sell, rent, or trade your personal or medical information under any circumstances.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">5. Refund & Cancellation Policy</h2>
              <p>
                We understand that plans can change. Please review our policy on cancellations and refunds:
              </p>
              <div className="rounded-lg border border-cyan-100 bg-cyan-50/50 p-4 space-y-2">
                <p>
                  <strong>Cancellation & Rescheduling:</strong> You may cancel or request rescheduling of your consultation slot up to <strong>2 hours prior</strong> to the booked slot time.
                </p>
                <p>
                  <strong>Refund Eligibility:</strong> Full refunds will be issued for requests made at least 2 hours before the appointment. If the doctor cancels the slot or is unavailable, a full refund will be processed automatically.
                </p>
                <p>
                  <strong>Late Cancellations/No-Shows:</strong> Cancellations made less than 2 hours before the slot, or failure to join the teleconsultation slot (no-show), are not eligible for a refund.
                </p>
                <p>
                  <strong>Refund Processing:</strong> Approved refunds are credited back to the original source payment method within <strong>5 to 7 working days</strong>.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">6. Patient Consent</h2>
              <p>
                By booking an online consultation, you explicitly consent to receiving medical guidance online and sharing necessary clinical records for review. You agree not to record, stream, or publish any audio/video session footage without the doctor's explicit written permission.
              </p>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-6">
              <h2 className="text-xl font-bold text-slate-900">7. Contact Information</h2>
              <p>
                For any questions regarding this policy, cancellations, or refund requests, please contact us at:
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                Email: <a href={`mailto:${clinic.email}`} className="text-cyan-700 hover:underline">{clinic.email}</a>
                <br />
                Phone: <a href={`tel:${clinic.phone}`} className="text-cyan-700 hover:underline">{clinic.phone}</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
