"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarCheck, X } from "lucide-react";
import { ReactNode, useState } from "react";
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
  message: z.string().min(5, "Please add a short message"),
});

type FormValues = z.infer<typeof schema>;

export function AppointmentModal({ trigger }: { trigger?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<FormStatus | null>(null);
  const today = getTodayDateInputValue();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setStatus(null);
    try {
      await api.createAppointment(values);
      setStatus({ type: "success", message: "Appointment request submitted. The clinic will contact you shortly." });
      reset();
    } catch (error) {
      setStatus({ type: "error", message: getErrorMessage(error) });
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger || <Button><CalendarCheck className="h-4 w-4" /> Book Appointment</Button>}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-xl font-bold text-slate-950">Book Appointment</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-600">Share your preferred date and contact details.</Dialog.Description>
            </div>
            <Dialog.Close className="rounded-md p-2 text-slate-500 hover:bg-slate-100" aria-label="Close appointment form">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4">
            <Field label="Patient Name" registration={register("patient_name")} error={errors.patient_name} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone Number" registration={register("phone")} error={errors.phone} />
              <Field label="Email (optional)" type="email" registration={register("email")} error={errors.email} />
            </div>
            <Field label="Preferred Date" type="date" min={today} registration={register("preferred_date")} error={errors.preferred_date} />
            <TextAreaField label="Message" registration={register("message")} error={errors.message} />
            <FormStatusMessage status={status} />
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit Request"}</Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function getTodayDateInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
