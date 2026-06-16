"use client";

import { CalendarCheck, LockKeyhole, LogOut, Mail, MessageSquareText, RefreshCw, Stethoscope } from "lucide-react";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, AppointmentRequest, ContactMessage, ConsultationRequest, DoctorProfile, getErrorMessage } from "@/services/api";

const tokenKey = "doctor_panel_token";

const paymentLabels: Record<string, string> = {
  iitr_student: "IITR Students",
  iitr_faculty_staff: "IITR Faculty/Staff",
  iitr_retired_faculty_staff: "IITR Retired Faculty/Staff",
  others: "All Others",
};

type PanelTab = "consultations" | "appointments" | "contacts";

export default function DoctorPanelPage() {
  const [token, setToken] = useState(() => typeof window === "undefined" ? "" : window.localStorage.getItem(tokenKey) || "");
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [activeTab, setActiveTab] = useState<PanelTab>("consultations");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  const isLoggedIn = Boolean(token && doctor);

  const clearSession = useCallback(() => {
    window.localStorage.removeItem(tokenKey);
    setToken("");
    setDoctor(null);
    setAppointments([]);
    setContacts([]);
    setConsultations([]);
  }, []);

  const loadPanel = useCallback(async (activeToken = token) => {
    if (!activeToken) return;

    setLoading(true);
    setStatus("");
    try {
      const [profileData, appointmentData, contactData, consultationData] = await Promise.all([
        api.getDoctorProfile(activeToken),
        api.listDoctorAppointments(activeToken),
        api.listDoctorContacts(activeToken),
        api.listDoctorConsultations(activeToken),
      ]);
      setDoctor(profileData.doctor);
      setAppointments(appointmentData.appointments);
      setContacts(contactData.contacts);
      setConsultations(consultationData.consultations);
    } catch (error) {
      setStatus(getErrorMessage(error));
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession, token]);

  useEffect(() => {
    if (!token || doctor) return;
    const timeout = window.setTimeout(() => {
      void loadPanel(token);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [doctor, loadPanel, token]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const data = await api.doctorLogin(loginForm);
      window.localStorage.setItem(tokenKey, data.token);
      setToken(data.token);
      setDoctor(data.doctor);
      await loadPanel(data.token);
    } catch (error) {
      setStatus(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    if (token) {
      await api.doctorLogout(token).catch(() => undefined);
    }
    clearSession();
  }

  const currentRows = useMemo(() => {
    if (activeTab === "appointments") return appointments.length;
    if (activeTab === "contacts") return contacts.length;
    return consultations.length;
  }, [activeTab, appointments.length, consultations.length, contacts.length]);

  if (!isLoggedIn) {
    return (
      <section className="min-h-screen bg-slate-100 px-4 py-12">
        <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-md bg-cyan-50 p-3 text-cyan-700">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-950">Doctor Panel</h1>
              <p className="text-sm text-slate-600">Login required</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="grid gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">Email</span>
              <Input className="mt-2" type="email" value={loginForm.email} onChange={(event) => setLoginForm((value) => ({ ...value, email: event.target.value }))} required />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">Password</span>
              <Input className="mt-2" type="password" value={loginForm.password} onChange={(event) => setLoginForm((value) => ({ ...value, password: event.target.value }))} required />
            </label>
            {status ? <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{status}</p> : null}
            <Button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</Button>
          </form>
        </div>
      </section>
    );
  }

  if (!doctor) return null;

  const activeDoctor = doctor;

  return (
    <section className="min-h-screen bg-slate-100">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">Doctor Panel</p>
            <h1 className="text-2xl font-bold text-slate-950">{activeDoctor.name}</h1>
            <p className="text-sm text-slate-600">{activeDoctor.email}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => loadPanel()} disabled={loading}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button type="button" variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setActiveTab("consultations")} className={tabClass(activeTab === "consultations")}>
            <Stethoscope className="h-4 w-4" /> Consultations ({consultations.length})
          </button>
          <button type="button" onClick={() => setActiveTab("appointments")} className={tabClass(activeTab === "appointments")}>
            <CalendarCheck className="h-4 w-4" /> Appointments ({appointments.length})
          </button>
          <button type="button" onClick={() => setActiveTab("contacts")} className={tabClass(activeTab === "contacts")}>
            <MessageSquareText className="h-4 w-4" /> Contact Messages ({contacts.length})
          </button>
        </div>

        {status ? <p className="mb-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{status}</p> : null}
        <div className="mb-3 text-sm font-semibold text-slate-600">{loading ? "Loading..." : `${currentRows} records`}</div>

        {activeTab === "consultations" ? <ConsultationsTable consultations={consultations} /> : null}
        {activeTab === "appointments" ? <AppointmentsTable appointments={appointments} /> : null}
        {activeTab === "contacts" ? <ContactsTable contacts={contacts} /> : null}
      </div>
    </section>
  );
}

function tabClass(active: boolean) {
  return `inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-semibold transition ${active ? "border-cyan-700 bg-cyan-700 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`;
}

function ContactsTable({ contacts }: { contacts: ContactMessage[] }) {
  if (!contacts.length) return <EmptyState text="No contact messages yet." />;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-slate-700">
          <tr>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Contact</th>
            <th className="px-4 py-3 font-semibold">Message</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {contacts.map((contact) => (
            <tr key={contact.id} className="align-top">
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(contact.created_at)}</td>
              <td className="px-4 py-3 font-semibold text-slate-950">{contact.name}</td>
              <td className="px-4 py-3 text-slate-700">
                <p>{contact.phone}</p>
                <p className="inline-flex items-center gap-1 text-slate-500"><Mail className="h-3 w-3" /> {contact.email || "Email not provided"}</p>
              </td>
              <td className="max-w-xl px-4 py-3 leading-6 text-slate-700">{contact.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AppointmentsTable({ appointments }: { appointments: AppointmentRequest[] }) {
  if (!appointments.length) return <EmptyState text="No appointment requests yet." />;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-slate-700">
          <tr>
            <th className="px-4 py-3 font-semibold">Submitted</th>
            <th className="px-4 py-3 font-semibold">Preferred Date</th>
            <th className="px-4 py-3 font-semibold">Patient</th>
            <th className="px-4 py-3 font-semibold">Contact</th>
            <th className="px-4 py-3 font-semibold">Message</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {appointments.map((appointment) => (
            <tr key={appointment.id} className="align-top">
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(appointment.created_at)}</td>
              <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-950">{formatDate(appointment.preferred_date)}</td>
              <td className="px-4 py-3 font-semibold text-slate-950">{appointment.patient_name}</td>
              <td className="px-4 py-3 text-slate-700">
                <p>{appointment.phone}</p>
                <p className="inline-flex items-center gap-1 text-slate-500"><Mail className="h-3 w-3" /> {appointment.email || "Email not provided"}</p>
              </td>
              <td className="max-w-xl px-4 py-3 leading-6 text-slate-700">{appointment.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ConsultationsTable({ consultations }: { consultations: ConsultationRequest[] }) {
  if (!consultations.length) return <EmptyState text="No consultation requests yet." />;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-slate-700">
          <tr>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Patient</th>
            <th className="px-4 py-3 font-semibold">Contact</th>
            <th className="px-4 py-3 font-semibold">Concern</th>
            <th className="px-4 py-3 font-semibold">Payment</th>
            <th className="px-4 py-3 font-semibold">Documents</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {consultations.map((consultation) => {
            const documents = consultation.document_urls?.length ? consultation.document_urls : consultation.document_url ? [consultation.document_url] : [];
            return (
              <tr key={consultation.id} className="align-top">
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(consultation.created_at)}</td>
                <td className="px-4 py-3 text-slate-700">
                  <p className="font-semibold text-slate-950">{consultation.name}</p>
                  <p>{consultation.age} years, {consultation.gender}</p>
                  <p>{consultation.address}</p>
                </td>
                <td className="px-4 py-3 text-slate-700">
                  <p>{consultation.phone}</p>
                  <p className="text-slate-500">{consultation.email || "Email not provided"}</p>
                </td>
                <td className="max-w-sm px-4 py-3 leading-6 text-slate-700">{consultation.symptoms}</td>
                <td className="px-4 py-3 text-slate-700">
                  <p>{paymentLabels[consultation.payment_category || ""] || "Not selected"}</p>
                  <p className="font-semibold text-slate-950">Rs. {consultation.consultation_fee || 0}</p>
                </td>
                <td className="px-4 py-3">
                  {documents.length ? (
                    <div className="grid gap-2">
                      {documents.map((document, index) => (
                        <a key={document} className="font-semibold text-cyan-700 hover:underline" href={document} target="_blank" rel="noreferrer">
                          Document {index + 1}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500">Not uploaded</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center font-semibold text-slate-600">{text}</div>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
