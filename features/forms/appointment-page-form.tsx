"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { Field, TextAreaField } from "./form-fields";

const schema = z.object({
  patient_name: z.string().min(2, "Enter patient name"),
  phone: z.string().min(10, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email"),
  preferred_date: z.string().min(1, "Choose a preferred date"),
  message: z.string().min(5, "Please add a message"),
});

type FormValues = z.infer<typeof schema>;

export function AppointmentPageForm() {
  const [status, setStatus] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setStatus(null);
    await api.createAppointment(values);
    setStatus("Appointment request submitted successfully.");
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4">
        <Field label="Patient Name" registration={register("patient_name")} error={errors.patient_name} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone Number" registration={register("phone")} error={errors.phone} />
          <Field label="Email" type="email" registration={register("email")} error={errors.email} />
        </div>
        <Field label="Preferred Date" type="date" registration={register("preferred_date")} error={errors.preferred_date} />
        <TextAreaField label="Message" registration={register("message")} error={errors.message} />
        {status ? <p className="rounded-md bg-teal-50 p-3 text-sm font-medium text-teal-800">{status}</p> : null}
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Book Appointment"}</Button>
      </div>
    </form>
  );
}
