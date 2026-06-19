"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarCheck, X } from "lucide-react";
import { ReactNode, useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { api, getErrorMessage } from "@/services/api";
import { Field, TextAreaField } from "./form-fields";
import { FormStatusMessage, type FormStatus } from "./form-status";
import { DeclarationConsentDialog } from "./consultation-form";

const paymentOptions = [
  { value: "iitr_student", label: "For IITR Students", fee: 150 },
  { value: "iitr_faculty_staff", label: "IITR Faculty (family)/Staff or Defence personnel", fee: 350 },
  { value: "iitr_retired_faculty_staff", label: "IITR Retired Faculty/Staff or Veterans", fee: 250 },
  { value: "others", label: "For All Others", fee: 400 },
];

const schema = z.object({
  patient_name: z.string().min(2, "Enter patient name"),
  phone: z.string().min(10, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  preferred_date: z.string().min(1, "Choose a preferred date").refine((value) => value >= getTodayDateInputValue(), "Preferred date cannot be in the past"),
  preferred_time: z.string().min(1, "Choose a preferred time"),
  paymentCategory: z.string().min(1, "Select payment category"),
  aadhaar_no: z.string().optional(),
  id_document: z.any().optional(),
  agree_contact_time: z.boolean().refine((val) => val === true, "You must accept this contact commitment"),
  agree_consent: z.boolean().refine((val) => val === true, "You must read and agree to the Declaration and Consent Statements"),
  message: z.string().min(5, "Please add a short message"),
}).superRefine((data, ctx) => {
  const discountCategories = ["iitr_student", "iitr_faculty_staff", "iitr_retired_faculty_staff"];
  
  if (data.preferred_date === getTodayDateInputValue() && data.preferred_time) {
    const [hours, minutes] = data.preferred_time.split(":").map(Number);
    const selectedDateTime = new Date();
    selectedDateTime.setHours(hours, minutes, 0, 0);
    const now = new Date();
    if (selectedDateTime <= now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Preferred time must be in the future",
        path: ["preferred_time"],
      });
    }
  }

  if (data.paymentCategory === "others") {
    if (!data.aadhaar_no || !/^\d{12}$/.test(data.aadhaar_no)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Valid 12-digit Aadhaar number is required",
        path: ["aadhaar_no"],
      });
    }
  } else if (discountCategories.includes(data.paymentCategory)) {
    if (data.aadhaar_no && data.aadhaar_no.trim() !== "" && !/^\d{12}$/.test(data.aadhaar_no)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Aadhaar number must be exactly 12 digits if provided",
        path: ["aadhaar_no"],
      });
    }
    if (!data.id_document || !data.id_document[0]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Student ID/ IITR Employee ID/Govt ID document upload is required",
        path: ["id_document"],
      });
    }
  }
});

type FormValues = z.infer<typeof schema>;

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function AppointmentModal({ trigger }: { trigger?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<FormStatus | null>(null);
  const [minTime, setMinTime] = useState<string>("");
  const today = getTodayDateInputValue();
  
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patient_name: "",
      phone: "",
      email: "",
      preferred_date: "",
      preferred_time: "",
      paymentCategory: "",
      aadhaar_no: "",
      message: "",
      agree_contact_time: false,
      agree_consent: false,
    }
  });
  
  const preferredDateValue = useWatch({ control, name: "preferred_date" });
  const paymentCategoryValue = useWatch({ control, name: "paymentCategory" });
  const showDocumentUpload = ["iitr_student", "iitr_faculty_staff", "iitr_retired_faculty_staff"].includes(paymentCategoryValue);
  const showAadhaar = !!paymentCategoryValue;

  useEffect(() => {
    if (preferredDateValue === today) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setMinTime(`${hours}:${minutes}`);
    } else {
      setMinTime("");
    }
  }, [preferredDateValue, today]);

  async function onSubmit(values: FormValues) {
    setStatus(null);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setStatus({ type: "error", message: "Failed to load Razorpay payment portal. Check your internet connection." });
        return;
      }

      // Check if full dates can be fetched
      const fullDatesData = await api.getFullDates();
      if (fullDatesData.full_dates && fullDatesData.full_dates.includes(values.preferred_date)) {
        setStatus({ type: "error", message: "This date is fully booked. Please choose another date." });
        return;
      }

      // Create payment order
      const order = await api.createOrder({ payment_category: values.paymentCategory });

      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "Dr. Deepika Bhardwaj Clinic",
        description: `Clinic Appointment Fee - ${paymentOptions.find(o => o.value === values.paymentCategory)?.label}`,
        order_id: order.id,
        handler: async function (response: any) {
          setStatus({ type: "info", message: "Payment authorized. Submitting appointment request..." });

          const formData = new FormData();
          formData.append("patient_name", values.patient_name);
          formData.append("phone", values.phone);
          if (values.email) formData.append("email", values.email);
          formData.append("preferred_date", values.preferred_date);
          formData.append("preferred_time", values.preferred_time);
          formData.append("payment_category", values.paymentCategory);
          formData.append("message", values.message);

          // Payment details
          formData.append("razorpay_order_id", response.razorpay_order_id);
          formData.append("razorpay_payment_id", response.razorpay_payment_id);
          formData.append("razorpay_signature", response.razorpay_signature);

          // Uploads and Aadhaar
          if (values.id_document && values.id_document[0]) {
            formData.append("id_document", values.id_document[0]);
          }
          if (values.aadhaar_no) {
            formData.append("aadhaar_no", values.aadhaar_no);
          }

          try {
            await api.createAppointment(formData);
            setStatus({ type: "success", message: "Appointment request and payment submitted. The clinic will contact you shortly." });
            setTimeout(() => {
              setOpen(false);
              reset();
              setStatus(null);
            }, 3000);
          } catch (error) {
            setStatus({ type: "error", message: getErrorMessage(error) });
          }
        },
        prefill: {
          name: values.patient_name,
          email: values.email || "",
          contact: values.phone,
        },
        theme: {
          color: "#0e7490",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
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
          <form onSubmit={handleSubmit(onSubmit, (errs) => {
            console.log("Validation errors:", errs);
            const firstError = Object.values(errs)[0];
            const errMsg = firstError?.message || "Please fill in all required fields correctly.";
            setStatus({ type: "error", message: `Validation Error: ${errMsg as string}` });
          })} className="mt-6 grid gap-4">
            <Field label="Patient Name" registration={register("patient_name")} error={errors.patient_name} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone Number" registration={register("phone")} error={errors.phone} />
              <Field label="Email (optional)" type="email" registration={register("email")} error={errors.email} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Preferred Date" type="date" min={today} registration={register("preferred_date")} error={errors.preferred_date} />
              <Field label="Preferred Time" type="time" min={minTime} registration={register("preferred_time")} error={errors.preferred_time} />
            </div>
            <TextAreaField label="Message" registration={register("message")} error={errors.message} />

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

            {showDocumentUpload ? (
              <label className="block">
                <span className="text-sm font-semibold text-slate-800">Upload Student ID / IITR Employee ID / Govt ID <span className="text-red-500">*</span></span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  className="mt-2 w-full rounded-md border border-slate-300 bg-white p-2 text-sm focus:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                  {...register("id_document")}
                />
                <span className="mt-1 block text-xs text-slate-500">Required. Upload your proof document. (Max 10 MB)</span>
                {errors.id_document ? <span className="mt-1 block text-sm text-red-600">{errors.id_document.message as string}</span> : null}
              </label>
            ) : null}

            {showAadhaar ? (
              <div className="grid gap-1">
                <Field 
                  label={paymentCategoryValue === "others" ? "Aadhaar No. (12 digits) *" : "Aadhaar No. (12 digits, optional)"}
                  registration={register("aadhaar_no")} 
                  error={errors.aadhaar_no} 
                />
              </div>
            ) : null}

            <div className="grid gap-2 rounded-md border border-cyan-100 bg-cyan-50 p-4 text-sm text-slate-700 sm:grid-cols-2">
              {paymentOptions.map((option) => (
                <p key={option.value} className="font-medium">
                  {option.label}: Rs. {option.fee}
                </p>
              ))}
            </div>

            <div className="grid gap-3 border-t border-slate-100 pt-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-cyan-700 focus:ring-cyan-500"
                  {...register("agree_contact_time")}
                />
                <span className="text-sm text-slate-700">
                  I understand that I will likely be contacted within 10-20 minutes starting the preferred time. <span className="text-red-500">*</span>
                </span>
              </label>
              {errors.agree_contact_time ? <span className="text-sm text-red-600">{errors.agree_contact_time.message}</span> : null}

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-cyan-700 focus:ring-cyan-500"
                  {...register("agree_consent")}
                />
                <span className="text-sm text-slate-700">
                  I have read the{" "}
                  <DeclarationConsentDialog
                    trigger={
                      <button type="button" className="text-cyan-700 underline font-semibold hover:text-cyan-800">
                        Declaration and Consent Statements
                      </button>
                    }
                  />{" "}
                  and agree with the same. <span className="text-red-500">*</span>
                </span>
              </label>
              {errors.agree_consent ? <span className="text-sm text-red-600">{errors.agree_consent.message}</span> : null}
            </div>

            <FormStatusMessage status={status} />
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Processing..." : "Pay & Book Appointment"}</Button>
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
