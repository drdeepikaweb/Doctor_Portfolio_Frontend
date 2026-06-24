"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/services/api";

export function AnnouncementMarquee() {
  const [info, setInfo] = useState<string>("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/settings/marquee_info`)
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && data.value) {
          setInfo(data.value);
        }
      })
      .catch((err) => console.error("Failed to load marquee info", err));
  }, []);

  if (!info || info.trim() === "") return null;

  return (
    <div className="w-full bg-amber-500 text-white py-2.5 font-extrabold text-sm sm:text-base shadow-md border-b border-amber-600 relative z-30 overflow-hidden select-none">
      <div className="animate-marquee-css whitespace-nowrap">
        📢 Important Announcement: {info}
      </div>
    </div>
  );
}
