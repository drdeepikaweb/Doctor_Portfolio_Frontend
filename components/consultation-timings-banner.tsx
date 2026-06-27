"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { formatConsultationTimings } from "@/lib/utils";

export function ConsultationTimingsBanner() {
  const [timingsText, setTimingsText] = useState("10 AM - 12 PM | 6 PM - 8 PM");

  useEffect(() => {
    api.getAllSettings()
      .then((settings) => {
        if (settings) {
          setTimingsText(formatConsultationTimings(settings));
        }
      })
      .catch((err) => console.error("Failed to load consultation timings:", err));
  }, []);

  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border-2 border-amber-300 bg-linear-to-r from-amber-50 to-orange-50 px-5 py-2.5 text-sm font-bold text-amber-900 shadow-md">
      <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
      Consultation Timings: Every day, {timingsText}
    </div>
  );
}
