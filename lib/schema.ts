import { clinic } from "@/lib/content";

export const medicalPractitionerSchema = {
  "@context": "https://schema.org",
  "@type": "Physician",
  name: clinic.doctor,
  medicalSpecialty: "Internal Medicine",
  description: "General medicine, preventive healthcare, chronic disease management, and online consultation.",
  telephone: clinic.phone,
  email: clinic.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: clinic.address,
    addressCountry: "IN",
  },
};

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  name: `${clinic.doctor} Clinic`,
  telephone: clinic.phone,
  email: clinic.email,
  address: clinic.address,
};
