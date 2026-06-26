import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { PageLoader } from "@/components/page-loader";
import { medicalPractitionerSchema, localBusinessSchema } from "@/lib/schema";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Dr. Deepika Bhardwaj | Internal Medicine & Preventive Healthcare",
    template: "%s | Dr. Deepika Bhardwaj",
  },
  description:
    "Consult Dr. Deepika Bhardwaj, MBBS, DNB, MD (General Medicine), for diabetes, hypertension, thyroid, respiratory, fever, digestive, and preventive healthcare.",
  keywords: [
    "Dr. Deepika Bhardwaj",
    "Internal Medicine",
    "MD General Medicine",
    "Diabetes treatment New Delhi",
    "Hypertension specialist",
    "Thyroid clinic",
    "Online medical consultation",
    "Telemedicine India",
    "Preventive healthcare",
    "General Physician New Delhi",
  ],
  creator: "Dr. Deepika Bhardwaj",
  publisher: "Dr. Deepika Bhardwaj Clinic",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Dr. Deepika Bhardwaj | General Medicine Consultation",
    description: "Compassionate internal medicine care, appointments, and online consultations.",
    url: "/",
    siteName: "Dr. Deepika Bhardwaj Clinic",
    images: ["/og-image.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dr. Deepika Bhardwaj | Internal Medicine",
    description: "Book appointments and online consultations for general medicine care.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-white font-sans text-slate-900 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalPractitionerSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <PageLoader />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
