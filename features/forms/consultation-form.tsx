"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, getErrorMessage } from "@/services/api";
import { Field, TextAreaField } from "./form-fields";
import { FormStatusMessage, type FormStatus } from "./form-status";
import { useLanguage } from "@/components/language-context";

const translations = {
  en: {
    fullName: "Full Name",
    fullNamePlaceholder: "Enter full name",
    age: "Age",
    agePlaceholder: "Enter age",
    gender: "Gender",
    selectGender: "Select gender",
    female: "Female",
    male: "Male",
    other: "Other",
    phone: "Phone Number (WhatsApp)",
    phonePlaceholder: "Enter a 10-digit phone number",
    email: "Email Address (optional)",
    emailPlaceholder: "Enter email address",
    reconsultationId: "Submission ID (if reconsulting within a week)",
    reconsultationIdPlaceholder: "e.g. AA20002606",
    address: "Address (for Bill)",
    addressPlaceholder: "Enter full address",
    preferredDate: "Preferred Date",
    preferredTime: "Preferred Time Slot",
    selectTimeSlot: "Select time slot",
    chooseDateFirst: "Choose preferred date first",
    uploadReports: "Upload previous lab report, prescription, blood report, X-ray, MRI, CT Scan, etc.",
    uploadReportsHelp: "Optional. PDF, JPG, PNG. Maximum file size: 10 MB each, up to 5 files.",
    selectedFiles: "Selected Files",
    remove: "Remove",
    paymentOption: "Payment Option",
    selectPayment: "Select payment category",
    uploadId: "Upload student ID",
    uploadIdHelp: "Required. Upload a single document - image/pdf etc. (Max 10 MB)",
    agreeContactTime: "I understand that I will likely be contacted within 15 minutes.",
    agreeConsent: "I have read the Declaration and Consent Statements and agree with the same.",
    declarationLink: "Declaration and Consent Statements",
    submitButton: "Pay and submit consultation request",
    submitting: "Processing...",
    validationError: "Validation Error: Please fill in all required fields correctly.",
    successMessage: "Consultation request and payment submitted successfully.",
    paymentAuthorized: "Payment authorized. Completing registration...",
    clinicName: "Dr. Deepika Bhardwaj Clinic",
    feeBannerTitle: "Consultation Fees:",
    declarationTitle: "Declaration and Consent Statements",
    declarationIntro: "By agreeing, signing or accepting this declaration, I (the patient) agree to the following standard terms:",
    declarationConsent: "Consent to Telemedicine",
    declarationConsentText: "I explicitly consent to receive medical consultation and treatment services via telecommunication (video call, audio, or messaging).",
    declarationBenefits: "Benefits and Risks",
    declarationBenefitsText: "I understand the benefits of receiving care from home, but also acknowledge the risks, such as potential technical interruptions or lack of a physical hands-on examination.",
    declarationConfidentiality: "Confidentiality",
    declarationConfidentialityText: "I understand that my medical records and consultation will be kept private. I agree not to record or screenshot the audio or video session without prior written permission from the doctor.",
    declarationAccurate: "Accurate Information",
    declarationAccurateText: "I declare that the symptoms and medical history I provide are accurate to the best of my knowledge.",
    declarationClose: "I Understand & Close",
  },
  hi: {
    fullName: "पूरा नाम",
    fullNamePlaceholder: "पूरा नाम दर्ज करें",
    age: "उम्र",
    agePlaceholder: "उम्र दर्ज करें",
    gender: "लिंग",
    selectGender: "लिंग चुनें",
    female: "महिला",
    male: "पुरुष",
    other: "अन्य",
    phone: "फ़ोन नंबर (WhatsApp)",
    phonePlaceholder: "10 अंकों का फ़ोन नंबर दर्ज करें",
    email: "ईमेल पता (वैकल्पिक)",
    emailPlaceholder: "ईमेल पता दर्ज करें",
    reconsultationId: "सबमिशन आईडी (यदि एक सप्ताह के भीतर फिर से परामर्श कर रहे हैं)",
    reconsultationIdPlaceholder: "जैसे: AA20002606",
    address: "पता (बिल के लिए)",
    addressPlaceholder: "पूरा पता दर्ज करें",
    preferredDate: "पसंदीदा तारीख",
    preferredTime: "पसंदीदा समय स्लॉट",
    selectTimeSlot: "समय स्लॉट चुनें",
    chooseDateFirst: "पहले पसंदीदा तारीख चुनें",
    uploadReports: "पिछली लैब रिपोर्ट, पर्चा, रक्त रिपोर्ट, एक्स-रे, एमआरआई, सीटी स्कैन आदि अपलोड करें",
    uploadReportsHelp: "वैकल्पिक। पीडीएफ, जेपीजी, पीएनजी। प्रत्येक फ़ाइल अधिकतम 10 एमबी, 5 फ़ाइलों तक।",
    selectedFiles: "चुनी गई फ़ाइलें",
    remove: "हटाएं",
    paymentOption: "भुगतान विकल्प",
    selectPayment: "भुगतान श्रेणी चुनें",
    uploadId: "छात्र आईडी अपलोड करें",
    uploadIdHelp: "आवश्यक। केवल एक दस्तावेज़ अपलोड करें - छवि/पीडीएफ आदि (अधिकतम 10 एमबी)",
    agreeContactTime: "मुझे समझ में आ गया है कि मुझसे 15 मिनट के भीतर संपर्क किया जा सकता है।",
    agreeConsent: "मैंने घोषणा और सहमति बयानों को पढ़ लिया है और उनसे सहमत हूँ।",
    declarationLink: "घोषणा और सहमति पत्र",
    submitButton: "भुगतान करें और परामर्श अनुरोध जमा करें",
    submitting: "प्रक्रिया जारी है...",
    validationError: "सत्यापन त्रुटि: कृपया सभी आवश्यक फ़ील्ड सही ढंग से भरें।",
    successMessage: "परामर्श अनुरोध और भुगतान सफलतापूर्वक सबमिट हो गया है।",
    paymentAuthorized: "भुगतान अधिकृत। पंजीकरण पूरा किया जा रहा है...",
    clinicName: "डॉ. दीपिका भारद्वाज क्लिनिक",
    feeBannerTitle: "परामर्श शुल्क:",
    declarationTitle: "घोषणा और सहमति पत्र",
    declarationIntro: "इस घोषणा से सहमत होने या स्वीकार करने से, मैं (मरीज) निम्नलिखित शर्तों से सहमत हूँ:",
    declarationConsent: "टेलीमेडिसिन के लिए सहमति",
    declarationConsentText: "मैं स्पष्ट रूप से दूरसंचार (वीडियो कॉल, ऑडियो या मैसेजिंग) के माध्यम से चिकित्सा परामर्श और उपचार प्राप्त करने की सहमति देता हूँ।",
    declarationBenefits: "लाभ और जोखिम",
    declarationBenefitsText: "मैं घर से देखभाल प्राप्त करने के लाभों को समझता हूँ, लेकिन इसके जोखिमों को भी स्वीकार करता हूँ, जैसे कि तकनीकी व्यवधान या भौतिक परीक्षण की कमी।",
    declarationConfidentiality: "गोपनीयता",
    declarationConfidentialityText: "मैं समझता हूँ कि मेरे मेडिकल रिकॉर्ड और परामर्श को निजी रखा जाएगा। मैं डॉक्टर की पूर्व लिखित अनुमति के बिना ऑडियो या वीडियो सत्र रिकॉर्ड या स्क्रीनशॉट नहीं करने के लिए सहमत हूँ।",
    declarationAccurate: "सटीक जानकारी",
    declarationAccurateText: "मैं घोषणा करता हूँ कि मेरे द्वारा प्रदान किए गए लक्षण और चिकित्सा इतिहास मेरी सर्वोत्तम जानकारी के अनुसार सटीक हैं।",
    declarationClose: "मैं समझता हूँ और बंद करें",
  }
};

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
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <Dialog.Title className="text-xl font-bold text-slate-950">{t.declarationTitle}</Dialog.Title>
            <Dialog.Close className="rounded-md p-2 text-slate-500 hover:bg-slate-100" aria-label="Close consent statement">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <div className="mt-4 text-sm text-slate-700 leading-6 space-y-4">
            <p className="font-semibold text-slate-900">{t.declarationIntro}</p>
            <p><strong>{t.declarationConsent}:</strong> {t.declarationConsentText}</p>
            <p><strong>{t.declarationBenefits}:</strong> {t.declarationBenefitsText}</p>
            <p><strong>{t.declarationConfidentiality}:</strong> {t.declarationConfidentialityText}</p>
            <p><strong>{t.declarationAccurate}:</strong> {t.declarationAccurateText}</p>
          </div>
          <div className="mt-6 flex justify-end">
            <Dialog.Close asChild>
              <Button type="button">{t.declarationClose}</Button>
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
  const { language } = useLanguage();
  const t = translations[language];
  const [status, setStatus] = useState<FormStatus | null>(null);
  const [uploadedReports, setUploadedReports] = useState<File[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const [loadingOverlay, setLoadingOverlay] = useState<string | null>(null);
  const today = getTodayDateInputValue();

  const paymentOptions = useMemo(() => [
    { value: "iitr_student", label: language === "hi" ? "आईआईटीआर छात्रों के लिए (छूट)" : "For IITR Students (Discounted)", fee: 150 },
    { value: "others", label: language === "hi" ? "अन्य सभी के लिए (सीजीएचएस दर)" : "For All Others (CGHS rate)", fee: 350 },
  ], [language]);

  const schema = useMemo(() => {
    return z.object({
      name: z.string().min(2, language === "hi" ? "कम से कम 2 अक्षर का नाम होना आवश्यक है" : "Enter full name"),
      age: z.coerce.number().min(1, language === "hi" ? "कृपया सही उम्र दर्ज करें" : "Enter age").max(120, language === "hi" ? "कृपया सही उम्र दर्ज करें" : "Enter a valid age"),
      gender: z.string().min(1, language === "hi" ? "कृपया लिंग चुनें" : "Select gender"),
      phone: z.string().min(10, language === "hi" ? "कृपया 10-अंकों का वैध फ़ोन नंबर दर्ज करें" : "Enter a valid phone number"),
      email: z.string().email(language === "hi" ? "कृपया वैध ईमेल दर्ज करें" : "Enter a valid email").optional().or(z.literal("")),
      address: z.string().min(5, language === "hi" ? "कृपया पूरा पता दर्ज करें" : "Enter full address"),
      preferred_date: z.string().min(1, language === "hi" ? "कृपया पसंदीदा तारीख चुनें" : "Choose a preferred date").refine((value) => value >= getTodayDateInputValue(), language === "hi" ? "पसंदीदा तारीख अतीत में नहीं हो सकती" : "Preferred date cannot be in the past"),
      preferred_time: z.string().min(1, language === "hi" ? "कृपया पसंदीदा समय स्लॉट चुनें" : "Choose a preferred time slot"),
      documents: z.any().optional(),
      reconsultation_id: z.string().optional().or(z.literal("")),
      paymentCategory: z.string().optional().or(z.literal("")),
      id_document: z.any().optional(),
      agree_contact_time: z.boolean().refine((val) => val === true, language === "hi" ? "आपको इसे स्वीकार करना होगा" : "You must accept this contact commitment"),
      agree_consent: z.boolean().refine((val) => val === true, language === "hi" ? "आपको घोषणा और सहमति स्वीकार करनी होगी" : "You must read and agree to the Declaration and Consent Statements"),
    }).superRefine((data, ctx) => {
      if (!data.reconsultation_id) {
        if (!data.paymentCategory) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: language === "hi" ? "कृपया भुगतान विकल्प चुनें" : "Select payment category",
            path: ["paymentCategory"],
          });
        } else if (data.paymentCategory === "iitr_student") {
          if (!data.id_document || !data.id_document[0]) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: language === "hi" ? "छात्र आईडी अपलोड करना आवश्यक है" : "Student ID document upload is required",
              path: ["id_document"],
            });
          }
        }
      }
    });
  }, [language]);

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      age: undefined,
      gender: "",
      phone: "",
      email: "",
      address: "",
      preferred_date: "",
      preferred_time: "",
      reconsultation_id: "",
      paymentCategory: "",
      agree_contact_time: false,
      agree_consent: false,
    }
  });
  
  const preferredDateValue = useWatch({ control, name: "preferred_date" });
  const paymentCategoryValue = useWatch({ control, name: "paymentCategory" });
  const reconsultationIdValue = useWatch({ control, name: "reconsultation_id" });

  const submitButtonText = useMemo(() => {
    if (reconsultationIdValue && reconsultationIdValue.trim() !== "") {
      return language === "hi" ? "परामर्श अनुरोध जमा करें" : "Submit consultation request";
    }
    return t.submitButton;
  }, [reconsultationIdValue, t.submitButton, language]);

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
        const unique = combined.filter((file, idx, self) =>
          self.findIndex((f) => f.name === file.name && f.size === file.size) === idx
        );
        return unique.slice(0, 5);
      });
    }
  };

  async function onSubmit(values: any) {
    setStatus(null);
    try {
      if (values.reconsultation_id && values.reconsultation_id.trim() !== "") {
        setLoadingOverlay(language === "hi" ? "सत्यापन और सबमिट किया जा रहा है..." : "Verifying & submitting...");
        setStatus({ type: "info", message: language === "hi" ? "सत्यापन और सबमिट किया जा रहा है..." : "Verifying & submitting..." });
        
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("age", String(values.age));
        formData.append("gender", values.gender);
        formData.append("phone", values.phone);
        if (values.email) formData.append("email", values.email);
        formData.append("address", values.address);
        formData.append("preferred_date", values.preferred_date);
        formData.append("preferred_time", values.preferred_time);
        formData.append("reconsultation_id", values.reconsultation_id.trim());

        uploadedReports.forEach((document) => formData.append("documents", document));

        try {
          await api.createConsultation(formData);
          setStatus({ type: "success", message: t.successMessage });
          reset();
          setUploadedReports([]);
        } catch (error) {
          setStatus({ type: "error", message: getErrorMessage(error) });
        } finally {
          setLoadingOverlay(null);
        }
        return;
      }

      setLoadingOverlay(language === "hi" ? "भुगतान पोर्टल लोड किया जा रहा है..." : "Loading payment portal...");
      
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setStatus({ type: "error", message: language === "hi" ? "रेजरपे भुगतान पोर्टल लोड करने में विफल। इंटरनेट जांचें।" : "Failed to load Razorpay payment portal. Check your internet connection." });
        setLoadingOverlay(null);
        return;
      }

      const order = await api.createOrder({ payment_category: values.paymentCategory });

      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: t.clinicName,
        description: `${language === "hi" ? "ऑनलाइन परामर्श शुल्क" : "Online Consultation Fee"} - ${paymentOptions.find(o => o.value === values.paymentCategory)?.label}`,
        order_id: order.id,
        handler: async function (response: any) {
          setLoadingOverlay(language === "hi" ? "भुगतान सत्यापित और परामर्श पंजीकृत किया जा रहा है..." : "Verifying payment & registering consultation...");
          setStatus({ type: "info", message: t.paymentAuthorized });

          const formData = new FormData();
          formData.append("name", values.name);
          formData.append("age", String(values.age));
          formData.append("gender", values.gender);
          formData.append("phone", values.phone);
          if (values.email) formData.append("email", values.email);
          formData.append("address", values.address);
          formData.append("preferred_date", values.preferred_date);
          formData.append("preferred_time", values.preferred_time);
          formData.append("payment_category", values.paymentCategory);
          formData.append("consultation_fee", String(order.amount / 100));

          formData.append("razorpay_order_id", response.razorpay_order_id);
          formData.append("razorpay_payment_id", response.razorpay_payment_id);
          formData.append("razorpay_signature", response.razorpay_signature);

          uploadedReports.forEach((document) => formData.append("documents", document));

          if (values.id_document && values.id_document[0]) {
            formData.append("id_document", values.id_document[0]);
          }

          try {
            await api.createConsultation(formData);
            setStatus({ type: "success", message: t.successMessage });
            reset();
            setUploadedReports([]);
          } catch (error) {
            setStatus({ type: "error", message: getErrorMessage(error) });
          } finally {
            setLoadingOverlay(null);
          }
        },
        modal: {
          ondismiss: function () {
            setLoadingOverlay(null);
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
      setLoadingOverlay(null);
    } catch (error) {
      setStatus({ type: "error", message: getErrorMessage(error) });
      setLoadingOverlay(null);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit, (errs) => {
        console.log("Validation errors:", errs);
        setStatus({ type: "error", message: t.validationError });
      })} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4">
          <Field label={t.fullName + " *"} placeholder={t.fullNamePlaceholder} registration={register("name")} error={errors.name} />
          
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.age + " *"} type="number" placeholder={t.agePlaceholder} registration={register("age")} error={errors.age} />
            
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">{t.gender} *</span>
              <select className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-100" {...register("gender")} aria-invalid={!!errors.gender}>
                <option value="">{t.selectGender}</option>
                <option value="female">{language === "hi" ? "महिला" : "Female"}</option>
                <option value="male">{language === "hi" ? "पुरुष" : "Male"}</option>
                <option value="other">{language === "hi" ? "अन्य" : "Other"}</option>
              </select>
              {errors.gender ? <span className="mt-1 block text-sm text-red-600">{(errors.gender as any).message}</span> : null}
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.phone + " *"} placeholder={t.phonePlaceholder} registration={register("phone")} error={errors.phone} />
            <Field label={t.email} type="email" placeholder={t.emailPlaceholder} registration={register("email")} error={errors.email} />
          </div>

          <Field label={t.address + " *"} placeholder={t.addressPlaceholder} registration={register("address")} error={errors.address} />
          
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.preferredDate + " *"} type="date" min={today} registration={register("preferred_date")} error={errors.preferred_date} />
            
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">{t.preferredTime} *</span>
              <select 
                className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-100" 
                {...register("preferred_time")} 
                disabled={!preferredDateValue}
                aria-invalid={!!errors.preferred_time}
              >
                <option value="">{preferredDateValue ? t.selectTimeSlot : t.chooseDateFirst}</option>
                {timeSlots.map((slot) => {
                  const isBlocked = blockedSlots.includes(slot);
                  const isPast = isSlotInPast(slot, preferredDateValue);
                  const isDisabled = isBlocked || isPast;
                  let label = slot;
                  if (isBlocked) label += language === "hi" ? " (सीटें फुल)" : " (Fully Booked)";
                  else if (isPast) label += language === "hi" ? " (बीत चुका है)" : " (Past)";
                  return (
                    <option key={slot} value={slot} disabled={isDisabled}>
                      {label}
                    </option>
                  );
                })}
              </select>
              {errors.preferred_time ? <span className="mt-1 block text-sm text-red-600">{(errors.preferred_time as any).message}</span> : null}
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">{t.uploadReports}</span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              multiple
              onChange={handleFileChange}
              className="mt-2 w-full rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm cursor-pointer"
            />
            <span className="mt-1 block text-xs text-slate-500">{t.uploadReportsHelp}</span>
          </label>

          {uploadedReports.length > 0 ? (
            <div className="mt-2 flex flex-col gap-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">{t.selectedFiles} ({uploadedReports.length}/5):</span>
              {uploadedReports.map((file, idx) => (
                <div key={`${file.name}-${idx}`} className="flex items-center justify-between text-xs bg-white border border-slate-200 px-3 py-1.5 rounded shadow-sm">
                  <span className="truncate max-w-62.5 font-medium text-slate-700">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  <button
                    type="button"
                    onClick={() => setUploadedReports((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-red-500 hover:text-red-700 font-bold ml-2 text-xs cursor-pointer"
                  >
                    {t.remove}
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <Field
            label={t.reconsultationId}
            placeholder={t.reconsultationIdPlaceholder}
            registration={register("reconsultation_id")}
            error={errors.reconsultation_id}
          />

          {!reconsultationIdValue && (
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">{t.paymentOption} *</span>
              <select className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-100" {...register("paymentCategory")} aria-invalid={!!errors.paymentCategory}>
                <option value="">{t.selectPayment}</option>
                {paymentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}: {language === "hi" ? "रु." : "Rs."} {option.fee}
                  </option>
                ))}
              </select>
              {errors.paymentCategory ? <span className="mt-1 block text-sm text-red-600">{(errors.paymentCategory as any).message}</span> : null}
            </label>
          )}

          {paymentCategoryValue === "iitr_student" && !reconsultationIdValue ? (
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">{t.uploadId} <span className="text-red-500">*</span></span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className="mt-2 w-full rounded-md border border-slate-300 bg-white p-2 text-sm focus:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-100 cursor-pointer"
                {...register("id_document")}
              />
              <span className="mt-1 block text-xs text-slate-500">{t.uploadIdHelp}</span>
              {errors.id_document ? <span className="mt-1 block text-sm text-red-600">{(errors.id_document as any).message}</span> : null}
            </label>
          ) : null}

          {!reconsultationIdValue && (
            <div className="grid gap-2 rounded-md border border-cyan-100 bg-cyan-50 p-4 text-sm text-slate-700 sm:grid-cols-2">
              <p className="font-bold text-cyan-900 border-b border-cyan-200/50 pb-1 col-span-2">{t.feeBannerTitle}</p>
              {paymentOptions.map((option) => (
                <p key={option.value} className="font-semibold">
                  {option.label}: {language === "hi" ? "रु." : "Rs."} {option.fee}
                </p>
              ))}
            </div>
          )}

          <div className="grid gap-3 border-t border-slate-100 pt-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300 text-cyan-700 focus:ring-cyan-500 cursor-pointer"
                {...register("agree_contact_time")}
              />
              <span className="text-sm text-slate-700">
                {t.agreeContactTime} <span className="text-red-500">*</span>
              </span>
            </label>
            {errors.agree_contact_time ? <span className="text-sm text-red-600">{(errors.agree_contact_time as any).message}</span> : null}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300 text-cyan-700 focus:ring-cyan-500 cursor-pointer"
                {...register("agree_consent")}
              />
              <span className="text-sm text-slate-700">
                {language === "hi" ? "मैंने " : "I have read the "}
                <DeclarationConsentDialog
                  trigger={
                    <button type="button" className="text-cyan-700 underline font-semibold hover:text-cyan-800 cursor-pointer">
                      {t.declarationLink}
                    </button>
                  }
                />
                {language === "hi" ? " को पढ़ लिया है और उससे सहमत हूँ।" : " and agree with the same."} <span className="text-red-500">*</span>
              </span>
            </label>
            {errors.agree_consent ? <span className="text-sm text-red-600">{(errors.agree_consent as any).message}</span> : null}
          </div>

          <FormStatusMessage status={status} />
          <Button type="submit" disabled={isSubmitting} className="cursor-pointer">{isSubmitting ? t.submitting : submitButtonText}</Button>
        </div>
      </form>

      {loadingOverlay && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/65 backdrop-blur-md transition-all duration-300">
          <div className="flex flex-col items-center gap-6 rounded-2xl bg-white/95 p-8 shadow-2xl border border-slate-100 max-w-sm w-full mx-4 text-center">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <div className="absolute h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-700"></div>
              <div className="absolute h-10 w-10 animate-ping rounded-full bg-cyan-100/50"></div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800 tracking-wide transition-all duration-300">
                {loadingOverlay}
              </h3>
              <p className="text-xs font-semibold text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                {language === "hi" 
                  ? "कृपया इस विंडो को बंद न करें या पेज को रीफ्रेश न करें।" 
                  : "Please do not close this window or refresh the page."}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
