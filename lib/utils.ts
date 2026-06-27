import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime12h(timeStr: string): string {
  if (!timeStr) return "";
  const [hrsStr, minsStr] = timeStr.split(":");
  const hrs = parseInt(hrsStr, 10);
  const mins = parseInt(minsStr, 10);
  if (isNaN(hrs) || isNaN(mins)) return timeStr;
  
  const ampm = hrs >= 12 ? "PM" : "AM";
  const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
  const displayMins = mins === 0 ? "" : `:${String(mins).padStart(2, "0")}`;
  return `${displayHrs}${displayMins} ${ampm}`;
}

export function formatConsultationTimings(settings: {
  morning_start?: string;
  morning_end?: string;
  morning_enabled?: string;
  evening_start?: string;
  evening_end?: string;
  evening_enabled?: string;
}) {
  const morningEnabled = settings.morning_enabled !== "false";
  const eveningEnabled = settings.evening_enabled !== "false";
  
  const morningPart = (morningEnabled && settings.morning_start && settings.morning_end)
    ? `${formatTime12h(settings.morning_start)} - ${formatTime12h(settings.morning_end)}`
    : "";
    
  const eveningPart = (eveningEnabled && settings.evening_start && settings.evening_end)
    ? `${formatTime12h(settings.evening_start)} - ${formatTime12h(settings.evening_end)}`
    : "";
    
  if (morningPart && eveningPart) {
    return `${morningPart} | ${eveningPart}`;
  } else if (morningPart) {
    return morningPart;
  } else if (eveningPart) {
    return eveningPart;
  } else {
    return "10 AM - 12 PM | 6 PM - 8 PM"; // fallback
  }
}

