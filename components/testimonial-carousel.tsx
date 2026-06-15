"use client";

import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";

const reviews = [
  { name: "Anita Sharma", text: "The consultation was calm, detailed, and very reassuring. My treatment plan was easy to follow.", rating: 5 },
  { name: "Rohit Mehra", text: "Clear diagnosis and practical advice for blood pressure management. Follow-up was excellent.", rating: 5 },
  { name: "Neha Kapoor", text: "Online consultation worked smoothly and the doctor explained every medicine carefully.", rating: 5 },
];

export function TestimonialCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % reviews.length), 4500);
    return () => window.clearInterval(timer);
  }, []);

  const review = reviews[active];

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Testimonials" title="What patients say" centered />
        <div className="mt-10 rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="flex justify-center gap-1 text-amber-400">
            {Array.from({ length: review.rating }).map((_, index) => <Star key={index} className="h-5 w-5 fill-current" />)}
          </div>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-700">"{review.text}"</p>
          <p className="mt-5 font-semibold text-slate-950">{review.name}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" size="icon" aria-label="Previous testimonial" onClick={() => setActive((active + reviews.length - 1) % reviews.length)}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" aria-label="Next testimonial" onClick={() => setActive((active + 1) % reviews.length)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </section>
  );
}
