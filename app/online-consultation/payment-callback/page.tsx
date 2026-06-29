"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";

function PaymentCallbackInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [details, setDetails] = useState<any>(null);
  const attempts = useRef(0);
  const maxAttempts = 10;
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!id) {
      setStatus("error");
      setErrorMsg("Missing consultation ID. Invalid payment redirect.");
      return;
    }

    const checkPaymentStatus = async () => {
      attempts.current += 1;
      try {
        console.log(`Verifying payment for consultation ID: ${id}, attempt: ${attempts.current}`);
        const res = await api.verifyPayment(id);

        if (res.success) {
          setStatus("success");
          setDetails(res.consultation);
          if (pollInterval.current) clearInterval(pollInterval.current);
        } else if (res.pending && attempts.current < maxAttempts) {
          // Keep loading, timer will trigger next poll
          console.log("Payment status is pending, polling again...");
        } else {
          setStatus("error");
          setErrorMsg(res.message || "Payment verification failed. Please contact the clinic.");
          if (pollInterval.current) clearInterval(pollInterval.current);
        }
      } catch (err: any) {
        if (attempts.current >= maxAttempts) {
          setStatus("error");
          setErrorMsg(err.message || "Verification timed out. Please contact the clinic.");
          if (pollInterval.current) clearInterval(pollInterval.current);
        }
      }
    };

    // Run immediately
    void checkPaymentStatus();

    // Start polling every 3 seconds
    pollInterval.current = setInterval(() => {
      void checkPaymentStatus();
    }, 3000);

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [id]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="relative flex h-20 w-20 items-center justify-center mb-6">
          <Loader2 className="h-16 w-16 text-cyan-700 animate-spin" />
          <div className="absolute h-10 w-10 animate-ping rounded-full bg-cyan-100/50"></div>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
          Verifying Your Payment
        </h1>
        <p className="text-sm font-semibold text-slate-500 max-w-md px-4 leading-relaxed">
          We are confirming your transaction with PhonePe. Please do not close this window or refresh the page.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center animate-fadeIn">
        <div className="rounded-full bg-red-50 p-4 text-red-600 mb-6 border border-red-150 shadow-inner">
          <AlertTriangle className="h-14 w-14 animate-pulse" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
          Payment Verification Failed
        </h1>
        <div className="rounded-xl bg-red-50/50 border border-red-100 p-4 text-sm text-red-700 font-semibold max-w-md mb-8 leading-relaxed">
          {errorMsg || "An error occurred while validating your transaction. If money was debited, it will be refunded or verified manually."}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <Button 
            onClick={() => window.location.reload()} 
            className="h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
          >
            Retry Verification
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push("/online-consultation")} 
            className="h-11 border-slate-350 font-bold rounded-xl"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Success State
  return (
    <div className="flex flex-col items-center text-center animate-fadeIn">
      <div className="rounded-full bg-emerald-50 p-4 text-emerald-600 mb-6 border border-emerald-150 shadow-inner animate-bounce">
        <CheckCircle2 className="h-14 w-14" />
      </div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
        Consultation Request Confirmed!
      </h1>
      <p className="text-sm font-semibold text-slate-500 max-w-sm mb-6 leading-relaxed">
        Your payment was processed successfully. A WhatsApp message is being sent to your phone.
      </p>

      <div className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left text-sm text-slate-700 font-medium space-y-4 shadow-sm mb-8">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <span className="text-slate-400 font-semibold uppercase text-xs tracking-wider">Submission ID (UHID)</span>
          <span className="font-mono text-cyan-700 font-bold bg-cyan-50 border border-cyan-150 px-2 py-0.5 rounded text-sm">
            {details?.submission_id}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 font-semibold uppercase text-xs tracking-wider">Patient Name</span>
          <span className="text-slate-850 font-bold text-slate-905">{details?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 font-semibold uppercase text-xs tracking-wider">Appointment Date</span>
          <span className="text-slate-850 font-bold">
            {details?.preferred_date ? new Date(details.preferred_date).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "N/A"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 font-semibold uppercase text-xs tracking-wider">Time Slot</span>
          <span className="text-slate-850 font-bold">{details?.preferred_time}</span>
        </div>
        <div className="flex justify-between border-t border-slate-200/80 pt-3">
          <span className="text-slate-400 font-semibold uppercase text-xs tracking-wider">Amount Paid</span>
          <span className="text-emerald-700 font-extrabold text-base">Rs. {details?.consultation_fee}</span>
        </div>
      </div>

      <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-4 text-cyan-900 text-xs font-semibold max-w-md leading-relaxed mb-8 shadow-sm">
        ℹ️ <strong>What's Next?</strong> The doctor will contact you on your registered WhatsApp phone number ({details?.phone}) within 15 minutes to initiate the consultation session.
      </div>

      <Button 
        onClick={() => router.push("/")} 
        className="w-full max-w-xs h-11 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-xl shadow-lg transition"
      >
        Return to Home Page
      </Button>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <section className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 md:p-10 shadow-2xl transition-all">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-12 w-12 text-cyan-700 animate-spin mb-4" />
            <h1 className="text-xl font-bold text-slate-850">Loading page...</h1>
          </div>
        }>
          <PaymentCallbackInner />
        </Suspense>
      </div>
    </section>
  );
}
