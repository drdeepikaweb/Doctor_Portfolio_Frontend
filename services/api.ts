export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: init?.body instanceof FormData ? init.headers : { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new Error("Unable to reach the clinic server. Please try again shortly.");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}

export const api = {
  createAppointment: (data: FormData) => request("/appointments", { method: "POST", body: data }),
  createContact: (data: unknown) => request("/contact", { method: "POST", body: JSON.stringify(data) }),
  createConsultation: (data: FormData) => request("/consultations", { method: "POST", body: data }),
  getVisitors: () => request<{ visitor_count: number }>("/visitors", { cache: "no-store" }),
  incrementVisitors: () => request<{ visitor_count: number }>("/visitors/increment", { method: "POST", credentials: "include" }),
  getFullDates: () => request<{ full_dates: string[] }>("/appointments/full-dates", { cache: "no-store" }),
  createOrder: (data: { payment_category: string }) => request<{ id: string; amount: number; currency: string; key: string }>("/payments/order", { method: "POST", body: JSON.stringify(data) }),
  doctorLogin: (data: unknown) => request<{ token: string; doctor: DoctorProfile; expires_at: string }>("/doctors/login", { method: "POST", body: JSON.stringify(data) }),
  doctorLogout: (token: string) => request<{ message: string }>("/doctors/logout", { method: "POST", headers: authHeaders(token) }),
  getDoctorProfile: (token: string) => request<{ doctor: DoctorProfile }>("/doctors/me", { headers: authHeaders(token), cache: "no-store" }),
  listDoctorAppointments: (token: string) => request<{ appointments: AppointmentRequest[] }>("/doctors/appointments", { headers: authHeaders(token), cache: "no-store" }),
  listDoctorContacts: (token: string) => request<{ contacts: ContactMessage[] }>("/doctors/contacts", { headers: authHeaders(token), cache: "no-store" }),
  listDoctorConsultations: (token: string) => request<{ consultations: ConsultationRequest[] }>("/doctors/consultations", { headers: authHeaders(token), cache: "no-store" }),
};

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export type DoctorProfile = {
  id: string;
  name: string;
  email: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  message: string;
  created_at: string;
};

export type AppointmentRequest = {
  id: string;
  patient_name: string;
  phone: string;
  email: string | null;
  preferred_date: string;
  preferred_time: string | null;
  payment_category: string | null;
  consultation_fee: number | null;
  aadhaar_no: string | null;
  id_document_url: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  message: string;
  created_at: string;
};

export type ConsultationRequest = {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string | null;
  address: string;
  symptoms: string;
  document_url: string | null;
  document_urls: string[];
  payment_category: string | null;
  consultation_fee: number | null;
  aadhaar_no: string | null;
  id_document_url: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
};

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
