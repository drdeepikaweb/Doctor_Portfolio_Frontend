"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, getErrorMessage } from "@/services/api";
import { Field, TextAreaField } from "./form-fields";
import { FormStatusMessage, type FormStatus } from "./form-status";

const paymentOptions = [
  { value: "iitr_student", label: "For IITR Students", fee: 150 },
  { value: "iitr_faculty_staff", label: "IITR Faculty (family)/Staff or Defence personnel", fee: 350 },
  { value: "iitr_retired_faculty_staff", label: "IITR Retired Faculty/Staff or Veterans", fee: 250 },
  { value: "others", label: "For All Others", fee: 400 },
];

const schema = z.object({
  name: z.string().min(2, "Enter full name"),
  age: z.coerce.number().min(1, "Enter age").max(120, "Enter a valid age"),
  gender: z.string().min(1, "Select gender"),
  phone: z.string().min(10, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  address: z.string().min(5, "Enter full address"),
  symptoms: z.string().min(10, "Describe symptoms / medical concerns (minimum 10 characters)"),
  preferred_date: z.string().min(1, "Choose a preferred date").refine((value) => value >= getTodayDateInputValue(), "Preferred date cannot be in the past"),
  preferred_time: z.string().min(1, "Choose a preferred time slot"),
  documents: z.any().optional(),
  paymentCategory: z.string().min(1, "Select payment category"),
  aadhaar_no: z.string().optional(),
  id_document: z.any().optional(),
  agree_contact_time: z.boolean().refine((val) => val === true, "You must accept this contact commitment"),
  agree_consent: z.boolean().refine((val) => val === true, "You must read and agree to the Declaration and Consent Statements"),
}).superRefine((data, ctx) => {
  const discountCategories = ["iitr_student", "iitr_faculty_staff", "iitr_retired_faculty_staff"];
  
  if (data.paymentCategory === "others") {
    if (!data.aadhaar_no || !/^\d{12}$/.test(data.aadhaar_no)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Valid 12-digit Aadhaar number is required for this category",
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

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

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

export function DeclarationConsentDialog({ trigger }: { trigger: React.ReactNode }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <Dialog.Title className="text-xl font-bold text-slate-950">Declaration and Consent Statements</Dialog.Title>
            <Dialog.Close className="rounded-md p-2 text-slate-500 hover:bg-slate-100" aria-label="Close consent statement">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <div className="mt-4 text-sm text-slate-700 leading-6 space-y-4">
            <p className="font-semibold text-slate-900">By agreeing, signing or accepting this declaration, I (the patient) agree to the following standard terms:</p>
            <p><strong>Consent to Telemedicine:</strong> I explicitly consent to receive medical consultation and treatment services via telecommunication (video call, audio, or messaging).</p>
            <p><strong>Benefits and Risks:</strong> I understand the benefits of receiving care from home, but also acknowledge the risks, such as potential technical interruptions or lack of a physical hands-on examination.</p>
            <p><strong>Confidentiality:</strong> I understand that my medical records and consultation will be kept private. I agree not to record or screenshot the audio or video session without prior written permission from the doctor.</p>
            <p><strong>Accurate Information:</strong> I declare that the symptoms and medical history I provide are accurate to the best of my knowledge.</p>
          </div>
          <div className="mt-6 flex justify-end">
            <Dialog.Close asChild>
              <Button type="button">I Understand & Close</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const timeSlots = [
  "10:00 - 10:30",
  "10:30 - 11:00",
  "11:00 - 11:30",
  "11:30 - 12:00",
  "12:00 - 12:30",
  "12:30 - 13:00",
  "13:00 - 13:30",
  "13:30 - 14:00",
  "17:00 - 17:30",
  "17:30 - 18:00",
  "18:00 - 18:30",
  "18:30 - 19:00",
  "19:00 - 19:30",
  "19:30 - 20:00",
];

function getTodayDateInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSlotInPast(slot: string, dateStr: string): boolean {
  const todayStr = getTodayDateInputValue();
  if (dateStr !== todayStr) return false;

  const startTime = slot.split(" - ")[0];
  const [hours, minutes] = startTime.split(":").map(Number);
  
  const slotDate = new Date();
  slotDate.setHours(hours, minutes, 0, 0);

  return slotDate <= new Date();
}

export function ConsultationForm() {
  const [status, setStatus] = useState<FormStatus | null>(null);
  const [uploadedReports, setUploadedReports] = useState<File[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const today = getTodayDateInputValue();

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      age: undefined,
      gender: "",
      phone: "",
      email: "",
      address: "",
      symptoms: "",
      preferred_date: "",
      preferred_time: "",
      paymentCategory: "",
      aadhaar_no: "",
      agree_contact_time: false,
      agree_consent: false,
    }
  });
  
  const preferredDateValue = useWatch({ control, name: "preferred_date" });
  const paymentCategoryValue = useWatch({ control, name: "paymentCategory" });
  const showDocumentUpload = ["iitr_student", "iitr_faculty_staff", "iitr_retired_faculty_staff"].includes(paymentCategoryValue);
  const showAadhaar = !!paymentCategoryValue;

  useEffect(() => {
    if (preferredDateValue) {
      api.getBookedSlots(preferredDateValue)
        .then((data) => {
          setBlockedSlots(data.blocked_slots || []);
        })
        .catch(() => {
          setBlockedSlots([]);
        });
    } else {
      setBlockedSlots([]);
    }
  }, [preferredDateValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesList = Array.from(e.target.files);
      setUploadedReports((prev) => {
        const combined = [...prev, ...filesList];
        // Unique check by name and size to prevent duplicate uploads
        const unique = combined.filter((file, idx, self) =>
          self.findIndex((f) => f.name === file.name && f.size === file.size) === idx
        );
        // Limit to max 5 files
        return unique.slice(0, 5);
      });
    }
  };

  async function onSubmit(values: FormValues) {
    setStatus(null);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setStatus({ type: "error", message: "Failed to load Razorpay payment portal. Check your internet connection." });
        return;
      }

      // Create order from backend
      const order = await api.createOrder({ payment_category: values.paymentCategory });

      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "Dr. Deepika Bhardwaj Clinic",
        description: `Online Consultation Fee - ${paymentOptions.find(o => o.value === values.paymentCategory)?.label}`,
        order_id: order.id,
        handler: async function (response: any) {
          setStatus({ type: "info", message: "Payment authorized. Completing registration..." });

          const formData = new FormData();
          formData.append("name", values.name);
          formData.append("age", String(values.age));
          formData.append("gender", values.gender);
          formData.append("phone", values.phone);
          if (values.email) formData.append("email", values.email);
          formData.append("address", values.address);
          formData.append("symptoms", values.symptoms);
          formData.append("preferred_date", values.preferred_date);
          formData.append("preferred_time", values.preferred_time);
          formData.append("payment_category", values.paymentCategory);
          formData.append("consultation_fee", String(order.amount / 100));

          // Payment details
          formData.append("razorpay_order_id", response.razorpay_order_id);
          formData.append("razorpay_payment_id", response.razorpay_payment_id);
          formData.append("razorpay_signature", response.razorpay_signature);

          // Add medical reports
          uploadedReports.forEach((document) => formData.append("documents", document));

          // Add Student/Employee ID upload
          if (values.id_document && values.id_document[0]) {
            formData.append("id_document", values.id_document[0]);
          }

          // Add Aadhaar No
          if (values.aadhaar_no) {
            formData.append("aadhaar_no", values.aadhaar_no);
          }

          try {
            await api.createConsultation(formData);
            setStatus({ type: "success", message: "Consultation request and payment submitted successfully." });
            reset();
            setUploadedReports([]);
          } catch (error) {
            setStatus({ type: "error", message: getErrorMessage(error) });
          }
        },
        prefill: {
          name: values.name,
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
    <form onSubmit={handleSubmit(onSubmit, (errs) => {
      console.log("Validation errors:", errs);
      const firstError = Object.values(errs)[0];
      const errMsg = firstError?.message || "Please fill in all required fields correctly.";
      setStatus({ type: "error", message: `Validation Error: ${errMsg as string}` });
    })} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
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
        
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Preferred Date *" type="date" min={today} registration={register("preferred_date")} error={errors.preferred_date} />
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Preferred Time Slot *</span>
            <select 
              className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-100" 
              {...register("preferred_time")} 
              disabled={!preferredDateValue}
              aria-invalid={!!errors.preferred_time}
            >
              <option value="">{preferredDateValue ? "Select time slot" : "Choose preferred date first"}</option>
              {timeSlots.map((slot) => {
                const isBlocked = blockedSlots.includes(slot);
                const isPast = isSlotInPast(slot, preferredDateValue);
                const isDisabled = isBlocked || isPast;
                let label = slot;
                if (isBlocked) label += " (Fully Booked)";
                else if (isPast) label += " (Past)";
                return (
                  <option key={slot} value={slot} disabled={isDisabled}>
                    {label}
                  </option>
                );
              })}
            </select>
            {errors.preferred_time ? <span className="mt-1 block text-sm text-red-600">{errors.preferred_time.message}</span> : null}
          </label>
        </div>

        <TextAreaField label="Describe symptoms / medical concerns *" registration={register("symptoms")} error={errors.symptoms} />
        
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Upload previous lab report, prescription, blood report, X-ray, MRI, CT Scan, etc.</span>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            multiple
            onChange={handleFileChange}
            className="mt-2 w-full rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm"
          />
          <span className="mt-1 block text-xs text-slate-500">Optional. PDF, JPG, PNG. Maximum file size: 10 MB each, up to 5 files.</span>
        </label>

        {uploadedReports.length > 0 ? (
          <div className="mt-2 flex flex-col gap-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Selected Files ({uploadedReports.length}/5):</span>
            {uploadedReports.map((file, idx) => (
              <div key={`${file.name}-${idx}`} className="flex items-center justify-between text-xs bg-white border border-slate-200 px-3 py-1.5 rounded shadow-sm">
                <span className="truncate max-w-62.5 font-medium text-slate-700">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                <button
                  type="button"
                  onClick={() => setUploadedReports((prev) => prev.filter((_, i) => i !== idx))}
                  className="text-red-500 hover:text-red-700 font-bold ml-2 text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : null}

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
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Processing..." : "Pay & Submit Consultation Request"}</Button>
      </div>
    </form>
  );
}
