"use client";

import { useEffect, useState } from "react";
import { ConsultationForm } from "@/features/forms/consultation-form";
import { SectionHeading } from "@/components/section-heading";
import { api } from "@/services/api";

function formatFullDates(dateStrings: string[]): string {
  if (!dateStrings.length) return "";

  // Parse strings to Date objects and sort them ascending
  const dates = dateStrings
    .map((d) => {
      // Append time to parse correctly as local date
      const [year, month, day] = d.split("-").map(Number);
      return new Date(year, month - 1, day);
    })
    .sort((a, b) => a.getTime() - b.getTime());

  // Group dates by year and month
  const groups: Record<string, { year: number; monthName: string; days: number[] }> = {};
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  dates.forEach((date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const key = `${year}-${month}`;
    if (!groups[key]) {
      groups[key] = { year, monthName: monthNames[month], days: [] };
    }
    groups[key].days.push(day);
  });

  const getOrdinal = (d: number) => {
    if (d > 3 && d < 21) return `${d}th`;
    switch (d % 10) {
      case 1: return `${d}st`;
      case 2: return `${d}nd`;
      case 3: return `${d}rd`;
      default: return `${d}th`;
    }
  };

  const formattedGroups = Object.values(groups).map(({ year, monthName, days }) => {
    // Find consecutive ranges of days
    const ranges: string[] = [];
    let start = days[0];
    let prev = days[0];

    for (let i = 1; i <= days.length; i++) {
      const current = days[i];
      if (current === prev + 1) {
        prev = current;
      } else {
        if (start === prev) {
          ranges.push(getOrdinal(start));
        } else {
          ranges.push(`${getOrdinal(start)}-${getOrdinal(prev)}`);
        }
        start = current;
        prev = current;
      }
    }

    let daysStr = "";
    if (ranges.length === 1) {
      daysStr = ranges[0];
    } else if (ranges.length === 2) {
      daysStr = `${ranges[0]} & ${ranges[1]}`;
    } else {
      daysStr = `${ranges.slice(0, -1).join(", ")}, & ${ranges[ranges.length - 1]}`;
    }

    return `${daysStr} ${monthName}, ${year}`;
  });

  return formattedGroups.join("; ");
}

export default function OnlineConsultationPage() {
  const [fullDatesText, setFullDatesText] = useState<string>("");

  useEffect(() => {
    api.getFullDates()
      .then((data) => {
        if (data.full_dates && data.full_dates.length > 0) {
          setFullDatesText(formatFullDates(data.full_dates));
        }
      })
      .catch((err) => console.error("Error loading full dates:", err));
  }, []);

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <SectionHeading
            eyebrow="Online Consultation"
            title="Secure consultation request"
            description="Submit patient details and relevant medical documents. Accepted formats: PDF, JPG, PNG up to 10 MB."
          />
          <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-md font-bold text-slate-900">Consultation Timings</h3>
            <p className="mt-2 text-sm text-slate-700">Every day, 10 AM - 2 PM | 5 PM - 8 PM.</p>
            {fullDatesText ? (
              <p className="mt-4 text-sm font-semibold text-red-600 animate-pulse">
                Appointment is full for {fullDatesText}.
              </p>
            ) : null}
          </div>
        </div>
        <ConsultationForm />
      </div>
    </section>
  );
}
