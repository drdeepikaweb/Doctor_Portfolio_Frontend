"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { api, getErrorMessage } from "@/services/api";
import { Field, TextAreaField } from "./form-fields";
import { FormStatusMessage, type FormStatus } from "./form-status";

const paymentOptions = [
  { value: "iitr_student", label: "For IITR Students", fee: 150 },
  { value: "iitr_faculty_staff", label: "For IITR Faculty/Staff", fee: 350 },
  { value: "iitr_retired_faculty_staff", label: "For IITR Retired Faculty/Staff", fee: 250 },
  { value: "others", label: "For All Others", fee: 400 },
];

const schema = z.object({
  name: z.string().min(2, "Enter full name"),
  age: z.coerce.number().min(1, "Enter age").max(120, "Enter a valid age"),
  gender: z.string().min(1, "Select gender"),
  phone: z.string().min(10, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  address: z.string().min(5, "Enter full address"),
  symptoms: z.string().min(10, "Describe medical concerns"),
  documents: z.any().optional(),
  paymentCategory: z.string().min(1, "Select payment category"),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

export function ConsultationForm() {
  const [status, setStatus] = useState<FormStatus | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormInput, unknown, FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setStatus(null);
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("age", String(values.age));
    formData.append("gender", values.gender);
    formData.append("phone", values.phone);
    if (values.email) formData.append("email", values.email);
    formData.append("address", values.address);
    formData.append("symptoms", values.symptoms);
    const paymentOption = paymentOptions.find((option) => option.value === values.paymentCategory);
    formData.append("payment_category", values.paymentCategory);
    formData.append("consultation_fee", String(paymentOption?.fee || 0));
    Array.from<File>(values.documents || []).forEach((document) => formData.append("documents", document));
    try {
      await api.createConsultation(formData);
      setStatus({ type: "success", message: "Consultation request submitted successfully." });
      reset();
    } catch (error) {
      setStatus({ type: "error", message: getErrorMessage(error) });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4">
        <Field label="Full Name" registration={register("name")} error={errors.name} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Age" type="number" registration={register("age")} error={errors.age} />
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Gender</span>
            <select className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-100" {...register("gender")} aria-invalid={!!errors.gender}>
              <option value="">Select gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
            {errors.gender ? <span className="mt-1 block text-sm text-red-600">{errors.gender.message}</span> : null}
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone Number" registration={register("phone")} error={errors.phone} />
          <Field label="Email Address (optional)" type="email" registration={register("email")} error={errors.email} />
        </div>
        <Field label="Address" registration={register("address")} error={errors.address} />
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Upload previous lab report, prescription, blood report, X-ray, MRI, CT Scan, etc.</span>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            multiple
            className="mt-2 w-full rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm"
            {...register("documents")}
          />
          <span className="mt-1 block text-xs text-slate-500">Optional. PDF, JPG, PNG. Maximum file size: 10 MB each, up to 5 files.</span>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Payment Option</span>
          <select className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-100" {...register("paymentCategory")} aria-invalid={!!errors.paymentCategory}>
            <option value="">Select payment category</option>
            {paymentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}: Rs. {option.fee}
              </option>
            ))}
          </select>
          {errors.paymentCategory ? <span className="mt-1 block text-sm text-red-600">{errors.paymentCategory.message}</span> : null}
        </label>
        <div className="grid gap-2 rounded-md border border-cyan-100 bg-cyan-50 p-4 text-sm text-slate-700 sm:grid-cols-2">
          {paymentOptions.map((option) => (
            <p key={option.value} className="font-medium">
              {option.label}: Rs. {option.fee}
            </p>
          ))}
        </div>
        <FormStatusMessage status={status} />
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Pay &Submit Consultation Request"}</Button>
      </div>
    </form>
  );
}
