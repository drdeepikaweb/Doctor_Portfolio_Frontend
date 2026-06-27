"use client";

import Link from "next/link";
import { clinic } from "@/lib/content";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsAndConditionsPage() {
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
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Terms & Conditions</h1>
              <p className="text-sm text-slate-500 font-semibold mt-0.5">Last updated: June 2026</p>
            </div>
          </div>

          <div className="mt-8 space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">1. Acceptance of Terms</h2>
              <p>
                By accessing this portal and booking a teleconsultation with <strong>{clinic.doctor}</strong>, you agree to comply with and be bound by the following Terms and Conditions. If you do not agree to these terms, please do not book a consultation.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">2. Scope of Services</h2>
              <p>
                This platform provides virtual medical consultation services. Virtual care is not a replacement for in-person medical evaluation in emergencies.
              </p>
              <div className="rounded-lg border border-red-150 bg-red-50/50 p-4 text-red-950">
                <strong>🚨 Medical Emergency Disclaimer:</strong> Virtual consultation is NOT for emergency medical care. If you are experiencing chest pain, severe shortness of breath, sudden weakness, or any life-threatening emergency, please visit the nearest hospital emergency room immediately.
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">3. Consultation Fees & Payment</h2>
              <p>
                Consultation bookings require pre-payment through our secure payment gateway partner, Razorpay.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>IITR Student Discounted Rate:</strong> Rs. 150 (Requires upload of valid student ID card).</li>
                <li><strong>General Category:</strong> Rs. 350.</li>
              </ul>
              <p className="text-xs text-slate-500 italic mt-1">
                Note: Standard rates may vary based on future regulatory modifications or changes decided by management.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">4. Cancellation & Refund Policy</h2>
              <p>
                All refunds and booking cancellations are subject to the following rules:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Cancellation Window:</strong> You can cancel or reschedule your slot up to <strong>2 hours before</strong> the appointment.
                </li>
                <li>
                  <strong>Refund Eligibility:</strong> Full refunds will be approved for cancellations requested within the cancellation window. If the doctor cancels the slot, a full refund is issued automatically.
                </li>
                <li>
                  <strong>No-Shows & Late Cancellations:</strong> If you miss the appointment or cancel with less than 2 hours remaining, no refund will be provided.
                </li>
                <li>
                  <strong>Refund Credit Timeline:</strong> Once processed, the refund will be credited back to your original source payment method in <strong>5-7 business days</strong>.
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">5. Free Follow-Up Consultation</h2>
              <p>
                We offer free follow-up consultations within <strong>7 days</strong> of your original consultation.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>You must enter your original <strong>UHID</strong> (Unique ID) on the consultation form.</li>
                <li>The system will verify the date of the original consultation. If the UHID is more than 7 days old, the request will be rejected, and you must proceed with a paid booking.</li>
                <li>Details like Name, Age, Gender, and Address will be locked to the details of the original booking.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">6. Technical & Clinical Limitations</h2>
              <p>
                Virtual consultations depend heavily on internet connection stability, audio-visual quality, and patient-reported symptoms. You acknowledge and accept these limitations. The doctor reserves the right to advise in-person clinical evaluations if the medical condition cannot be safely managed virtually.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">7. Session Confidentiality</h2>
              <p>
                Medical consultations are strictly private. Recording, screenshotting, or distributing audio-visual media from the sessions is prohibited without prior written consent from {clinic.doctor}.
              </p>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-6">
              <h2 className="text-xl font-bold text-slate-900">8. Contact Us</h2>
              <p>
                For booking assistance, rescheduling, or refund requests, please email us at <a href={`mailto:${clinic.email}`} className="text-cyan-700 hover:underline">{clinic.email}</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
