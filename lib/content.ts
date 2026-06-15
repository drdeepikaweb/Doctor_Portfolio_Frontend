import {
  Activity,
  ClipboardPlus,
  HeartPulse,
  Pill,
  Scale,
  ShieldCheck,
  Soup,
  Stethoscope,
  Syringe,
  Thermometer,
  Wind,
} from "lucide-react";

export const clinic = {
  doctor: "Dr. Deepika Bhardwaj",
  credentials: "MBBS, DNB, MD (General Medicine)",
  tagline: "Comprehensive Internal Medicine & Preventive Healthcare",
  phone: "+91 98765 43210",
  email: "clinic@example.com",
  address: "Clinic Address, New Delhi, India",
  mapQuery: "New Delhi medical clinic",
  whatsapp: "919876543210",
};

export const treatments = [
  { title: "Diabetes Management", description: "Blood sugar monitoring, medication review, nutrition guidance, and complication prevention.", icon: Activity },
  { title: "Hypertension Treatment", description: "Blood pressure control plans with lifestyle support and medication optimization.", icon: HeartPulse },
  { title: "Thyroid Disorders", description: "Assessment and management for hypothyroidism, hyperthyroidism, and related symptoms.", icon: Pill },
  { title: "Respiratory Diseases", description: "Care for cough, breathlessness, chest infections, and chronic respiratory concerns.", icon: Wind },
  { title: "Asthma Care", description: "Inhaler guidance, trigger management, and action plans for better breathing control.", icon: ShieldCheck },
  { title: "Infectious Diseases", description: "Evaluation and treatment for common infections with responsible antibiotic use.", icon: Syringe },
  { title: "Fever Management", description: "Diagnosis-focused care for viral fever, dengue-like illness, malaria-like symptoms, and more.", icon: Thermometer },
  { title: "Digestive Disorders", description: "Support for acidity, abdominal pain, bowel changes, nausea, and digestive discomfort.", icon: Soup },
  { title: "Lifestyle Disorders", description: "Risk reduction for metabolic concerns through practical lifestyle and medical care.", icon: Scale },
  { title: "Preventive Health Checkups", description: "Screening, risk assessment, vaccinations, and wellness follow-up.", icon: ClipboardPlus },
  { title: "General Health Consultations", description: "First-contact medical advice for ongoing symptoms and overall health concerns.", icon: Stethoscope },
];

export const detailedTreatments = [
  "Diabetes Management",
  "Hypertension",
  "Thyroid Disorders",
  "Asthma",
  "COPD",
  "Respiratory Infections",
  "Viral Fever",
  "Gastrointestinal Disorders",
  "Obesity & Lifestyle Disorders",
  "General Medical Consultation",
];
