"use client";

import { CalendarCheck, LockKeyhole, LogOut, Mail, MessageSquareText, RefreshCw, Stethoscope, Phone, FileText } from "lucide-react";
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
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
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
    setVisitorCount(null);
  }, []);

  const loadPanel = useCallback(async (activeToken = token) => {
    if (!activeToken) return;

    setLoading(true);
    setStatus("");
    try {
      const [profileData, appointmentData, contactData, consultationData, visitorData] = await Promise.all([
        api.getDoctorProfile(activeToken),
        api.listDoctorAppointments(activeToken),
        api.listDoctorContacts(activeToken),
        api.listDoctorConsultations(activeToken),
        api.getVisitors(),
      ]);
      setDoctor(profileData.doctor);
      setAppointments(appointmentData.appointments);
      setContacts(contactData.contacts);
      setConsultations(consultationData.consultations);
      setVisitorCount(visitorData.visitor_count);
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
      <section className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mb-6 flex items-center gap-4">
            <div className="rounded-xl bg-cyan-50 p-4 text-cyan-700 shadow-inner">
              <LockKeyhole className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Doctor Panel</h1>
              <p className="text-sm text-slate-500 font-medium">Authentication required</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="grid gap-5">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Email Address</span>
              <Input className="mt-2 h-11 border-slate-300 rounded-lg focus:ring-cyan-500" type="email" value={loginForm.email} onChange={(event) => setLoginForm((value) => ({ ...value, email: event.target.value }))} required />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Password</span>
              <Input className="mt-2 h-11 border-slate-300 rounded-lg focus:ring-cyan-500" type="password" value={loginForm.password} onChange={(event) => setLoginForm((value) => ({ ...value, password: event.target.value }))} required />
            </label>
            {status ? <p className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm font-semibold text-red-700">{status}</p> : null}
            <Button type="submit" disabled={loading} className="h-11 rounded-lg text-sm font-bold bg-cyan-700 hover:bg-cyan-800 text-white shadow-lg transition-all">{loading ? "Logging in..." : "Access Dashboard"}</Button>
          </form>
        </div>
      </section>
    );
  }

  if (!doctor) return null;

  const activeDoctor = doctor;

  return (
    <section className="min-h-screen bg-slate-50/50 pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-700">Clinic Portal</p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">{activeDoctor.name}</h1>
            <p className="text-sm font-semibold text-slate-500 mt-0.5">{activeDoctor.email}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => loadPanel()} disabled={loading} className="h-11 rounded-lg shadow-sm border-slate-300 text-sm font-bold gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button type="button" variant="ghost" onClick={handleLogout} className="h-11 rounded-lg text-sm font-bold gap-2 text-slate-600 hover:bg-slate-100">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[95%] px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Statistics Dashboard Overview */}
        <div className="mb-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center gap-5">
              <div className="rounded-xl bg-cyan-50 p-4 text-cyan-700">
                <Stethoscope className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Consultations</p>
                <p className="mt-1 text-3xl font-black text-slate-900 leading-none">{consultations.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center gap-5">
              <div className="rounded-xl bg-emerald-50 p-4 text-emerald-700">
                <CalendarCheck className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Appointments</p>
                <p className="mt-1 text-3xl font-black text-slate-900 leading-none">{appointments.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center gap-5">
              <div className="rounded-xl bg-amber-50 p-4 text-amber-700">
                <MessageSquareText className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Messages</p>
                <p className="mt-1 text-3xl font-black text-slate-900 leading-none">{contacts.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center gap-5">
              <div className="rounded-xl bg-indigo-50 p-4 text-indigo-700">
                <RefreshCw className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Website Views</p>
                <p className="mt-1 text-3xl font-black text-slate-900 leading-none">{visitorCount !== null ? visitorCount : "..."}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setActiveTab("consultations")} className={tabClass(activeTab === "consultations")}>
            <Stethoscope className="h-4 w-4" /> Consultations
          </button>
          <button type="button" onClick={() => setActiveTab("appointments")} className={tabClass(activeTab === "appointments")}>
            <CalendarCheck className="h-4 w-4" /> Appointments
          </button>
          <button type="button" onClick={() => setActiveTab("contacts")} className={tabClass(activeTab === "contacts")}>
            <MessageSquareText className="h-4 w-4" /> Contact Messages
          </button>
        </div>

        {status ? <p className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm font-semibold text-red-700">{status}</p> : null}
        
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-bold uppercase tracking-wider text-slate-500">
            {loading ? "Refreshing records..." : `Showing ${currentRows} records`}
          </div>
        </div>

        {/* Data Tables */}
        <div className="transition-all duration-300">
          {activeTab === "consultations" ? <ConsultationsTable consultations={consultations} /> : null}
          {activeTab === "appointments" ? <AppointmentsTable appointments={appointments} /> : null}
          {activeTab === "contacts" ? <ContactsTable contacts={contacts} /> : null}
        </div>
      </div>
    </section>
  );
}

function tabClass(active: boolean) {
  return `inline-flex h-12 items-center gap-2 rounded-xl border px-6 text-sm font-bold tracking-wider uppercase transition-all duration-200 ${
    active 
      ? "border-cyan-700 bg-cyan-700 text-white shadow-md shadow-cyan-700/10" 
      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm"
  }`;
}

function ContactsTable({ contacts }: { contacts: ContactMessage[] }) {
  if (!contacts.length) return <EmptyState text="No contact messages yet." />;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-base">
        <thead className="bg-slate-100/80 text-left text-slate-700 uppercase text-xs tracking-wider font-bold border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 font-extrabold">Date</th>
            <th className="px-6 py-4 font-extrabold">Name</th>
            <th className="px-6 py-4 font-extrabold">Contact Details</th>
            <th className="px-6 py-4 font-extrabold">Message</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {contacts.map((contact) => {
            const rawPhone = contact.phone || "";
            const formattedPhone = rawPhone.replace(/\D/g, "");
            const waNumber = formattedPhone.startsWith("91") ? formattedPhone : `91${formattedPhone}`;
            const waUrl = `https://wa.me/${waNumber}`;
            return (
              <tr key={contact.id} className="align-top hover:bg-slate-50/50 transition-colors">
                <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-500">{formatDate(contact.created_at)}</td>
                <td className="px-6 py-4 font-bold text-slate-900 text-base">{contact.name}</td>
                <td className="px-6 py-4 text-slate-700">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-bold text-slate-900 text-base">{contact.phone}</span>
                    <a href={waUrl} target="_blank" rel="noreferrer" title="Chat on WhatsApp" className="inline-flex items-center gap-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white px-2.5 py-1 text-xs font-bold transition-all shadow-sm border border-emerald-200/50">
                      <Phone className="h-3 w-3" /> Chat
                    </a>
                  </div>
                  <p className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-semibold"><Mail className="h-3.5 w-3.5" /> {contact.email || "Email not provided"}</p>
                </td>
                <td className="max-w-xl px-6 py-4 leading-relaxed text-slate-700 font-medium">{contact.message}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AppointmentsTable({ appointments }: { appointments: AppointmentRequest[] }) {
  if (!appointments.length) return <EmptyState text="No appointment requests yet." />;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-base">
        <thead className="bg-slate-100/80 text-left text-slate-700 uppercase text-xs tracking-wider font-bold border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 font-extrabold">Submitted</th>
            <th className="px-6 py-4 font-extrabold">Preferred Time</th>
            <th className="px-6 py-4 font-extrabold">Patient</th>
            <th className="px-6 py-4 font-extrabold">Contact Details</th>
            <th className="px-6 py-4 font-extrabold">Payment</th>
            <th className="px-6 py-4 font-extrabold">Aadhaar No.</th>
            <th className="px-6 py-4 font-extrabold">Verification ID</th>
            <th className="px-6 py-4 font-extrabold">Message</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {appointments.map((appointment) => {
            const rawPhone = appointment.phone || "";
            const formattedPhone = rawPhone.replace(/\D/g, "");
            const waNumber = formattedPhone.startsWith("91") ? formattedPhone : `91${formattedPhone}`;
            const waUrl = `https://wa.me/${waNumber}`;
            return (
              <tr key={appointment.id} className="align-top hover:bg-slate-50/50 transition-colors">
                <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-500">{formatDate(appointment.created_at)}</td>
                <td className="whitespace-nowrap px-6 py-4 font-bold text-slate-900 text-base">
                  <p>{formatDate(appointment.preferred_date).split("at")[0]}</p>
                  <p className="text-xs text-cyan-800 font-bold mt-1 bg-cyan-50 border border-cyan-200/50 px-2 py-0.5 rounded w-fit">at {appointment.preferred_time || "N/A"}</p>
                </td>
                <td className="px-6 py-4 font-bold text-slate-900 text-base">{appointment.patient_name}</td>
                <td className="px-6 py-4 text-slate-700">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-bold text-slate-900 text-base">{appointment.phone}</span>
                    <a href={waUrl} target="_blank" rel="noreferrer" title="Chat on WhatsApp" className="inline-flex items-center gap-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white px-2.5 py-1 text-xs font-bold transition-all shadow-sm border border-emerald-200/50">
                      <Phone className="h-3 w-3" /> Chat
                    </a>
                  </div>
                  <p className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-semibold"><Mail className="h-3.5 w-3.5" /> {appointment.email || "Email not provided"}</p>
                </td>
                <td className="px-6 py-4 text-slate-700">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-bold text-slate-900 text-sm">{paymentLabels[appointment.payment_category || ""] || appointment.payment_category || "N/A"}</span>
                    {appointment.consultation_fee !== null ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700 w-fit">
                        Rs. {appointment.consultation_fee} (Paid)
                      </span>
                    ) : null}
                    {appointment.razorpay_payment_id ? <p className="text-[10px] font-mono text-slate-400 font-semibold">Txn: {appointment.razorpay_payment_id}</p> : null}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700 whitespace-nowrap">
                  {appointment.aadhaar_no ? (
                    <span className="font-mono bg-slate-50 border border-slate-200 px-3 py-1 rounded text-sm text-slate-800 font-bold tracking-wider">{appointment.aadhaar_no}</span>
                  ) : (
                    <span className="text-slate-400 text-sm font-semibold">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-700">
                  {appointment.id_document_url ? (
                    <a className="inline-flex items-center gap-1 rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-700 hover:bg-cyan-100 hover:text-cyan-800 transition border border-cyan-200/50 shadow-sm" href={appointment.id_document_url} target="_blank" rel="noreferrer">
                      View ID
                    </a>
                  ) : (
                    <span className="text-slate-400 text-sm font-semibold">N/A</span>
                  )}
                </td>
                <td className="max-w-xs px-6 py-4 leading-relaxed text-slate-700 font-medium">{appointment.message}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ConsultationsTable({ consultations }: { consultations: ConsultationRequest[] }) {
  if (!consultations.length) return <EmptyState text="No consultation requests yet." />;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-base">
        <thead className="bg-slate-100/80 text-left text-slate-700 uppercase text-xs tracking-wider font-bold border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 font-extrabold">Date</th>
            <th className="px-6 py-4 font-extrabold">Patient Details</th>
            <th className="px-6 py-4 font-extrabold">Contact Details</th>
            <th className="px-6 py-4 font-extrabold">Concern</th>
            <th className="px-6 py-4 font-extrabold">Payment</th>
            <th className="px-6 py-4 font-extrabold">Aadhaar No.</th>
            <th className="px-6 py-4 font-extrabold">Verification ID</th>
            <th className="px-6 py-4 font-extrabold">Medical Reports</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {consultations.map((consultation) => {
            const documents = consultation.document_urls?.length ? consultation.document_urls : consultation.document_url ? [consultation.document_url] : [];
            const rawPhone = consultation.phone || "";
            const formattedPhone = rawPhone.replace(/\D/g, "");
            const waNumber = formattedPhone.startsWith("91") ? formattedPhone : `91${formattedPhone}`;
            const waUrl = `https://wa.me/${waNumber}`;
            return (
              <tr key={consultation.id} className="align-top hover:bg-slate-50/50 transition-colors">
                <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-500">{formatDate(consultation.created_at)}</td>
                <td className="px-6 py-4 text-slate-700">
                  <p className="font-bold text-slate-900 text-base">{consultation.name}</p>
                  <p className="text-sm text-slate-600 font-semibold mt-0.5">{consultation.age} years, {consultation.gender}</p>
                  <p className="text-xs text-slate-400 mt-1 font-medium max-w-[200px] truncate" title={consultation.address}>{consultation.address}</p>
                </td>
                <td className="px-6 py-4 text-slate-700">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-bold text-slate-900 text-base">{consultation.phone}</span>
                    <a href={waUrl} target="_blank" rel="noreferrer" title="Chat on WhatsApp" className="inline-flex items-center gap-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white px-2.5 py-1 text-xs font-bold transition-all shadow-sm border border-emerald-200/50">
                      <Phone className="h-3 w-3" /> Chat
                    </a>
                  </div>
                  <p className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-semibold"><Mail className="h-3.5 w-3.5" /> {consultation.email || "Email not provided"}</p>
                </td>
                <td className="max-w-xs px-6 py-4 leading-relaxed text-slate-700 font-medium">{consultation.symptoms}</td>
                <td className="px-6 py-4 text-slate-700">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-bold text-slate-900 text-sm">{paymentLabels[consultation.payment_category || ""] || consultation.payment_category || "Not selected"}</span>
                    {consultation.consultation_fee !== null ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700 w-fit">
                        Rs. {consultation.consultation_fee} (Paid)
                      </span>
                    ) : null}
                    {consultation.razorpay_payment_id ? <p className="text-[10px] font-mono text-slate-400 font-semibold">Txn: {consultation.razorpay_payment_id}</p> : null}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700 whitespace-nowrap">
                  {consultation.aadhaar_no ? (
                    <span className="font-mono bg-slate-50 border border-slate-200 px-3 py-1 rounded text-sm text-slate-800 font-bold tracking-wider">{consultation.aadhaar_no}</span>
                  ) : (
                    <span className="text-slate-400 text-sm font-semibold">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-700">
                  {consultation.id_document_url ? (
                    <a className="inline-flex items-center gap-1 rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-700 hover:bg-cyan-100 hover:text-cyan-800 transition border border-cyan-200/50 shadow-sm" href={consultation.id_document_url} target="_blank" rel="noreferrer">
                      View ID
                    </a>
                  ) : (
                    <span className="text-slate-400 text-sm font-semibold">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {documents.length ? (
                    <div className="flex flex-col gap-1.5">
                      {documents.map((document, index) => (
                        <a key={document} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 text-xs font-bold tracking-tight transition border border-slate-300/30 w-fit shadow-sm" href={document} target="_blank" rel="noreferrer">
                          <FileText className="h-3.5 w-3.5 text-slate-500" /> Report {index + 1}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 text-sm font-semibold">No reports</span>
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
  return <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center font-bold text-slate-500 text-base">{text}</div>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
