"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { api, getErrorMessage } from "@/services/api";
import { Field, TextAreaField } from "./form-fields";
import { FormStatusMessage, type FormStatus } from "./form-status";

const schema = z.object({
  patient_name: z.string().min(2, "Enter patient name"),
  phone: z.string().min(10, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  preferred_date: z.string().min(1, "Choose a preferred date").refine((value) => value >= getTodayDateInputValue(), "Preferred date cannot be in the past"),
  message: z.string().min(5, "Please add a message"),
});

type FormValues = z.infer<typeof schema>;

export function AppointmentPageForm() {
  const [status, setStatus] = useState<FormStatus | null>(null);
  const today = getTodayDateInputValue();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setStatus(null);
    try {
      await api.createAppointment(values);
      setStatus({ type: "success", message: "Appointment request submitted successfully." });
      reset();
    } catch (error) {
      setStatus({ type: "error", message: getErrorMessage(error) });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4">
        <Field label="Patient Name" registration={register("patient_name")} error={errors.patient_name} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone Number" registration={register("phone")} error={errors.phone} />
          <Field label="Email (optional)" type="email" registration={register("email")} error={errors.email} />
        </div>
        <Field label="Preferred Date" type="date" min={today} registration={register("preferred_date")} error={errors.preferred_date} />
        <TextAreaField label="Message" registration={register("message")} error={errors.message} />
        <FormStatusMessage status={status} />
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Book Appointment"}</Button>
      </div>
    </form>
  );
}

function getTodayDateInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
