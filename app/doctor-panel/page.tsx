"use client";

import { LockKeyhole, LogOut, Mail, MessageSquareText, RefreshCw, Stethoscope, Phone, FileText, Settings } from "lucide-react";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, ContactMessage, ConsultationRequest, DoctorProfile, getErrorMessage, API_BASE_URL } from "@/services/api";

const tokenKey = "doctor_panel_token";

const paymentLabels: Record<string, string> = {
  iitr_student: "For IITR Students (Discounted)",
  others: "For All Others (CGHS rate)",
};

type PanelTab = "consultations" | "contacts" | "settings";

export default function DoctorPanelPage() {
  const [token, setToken] = useState(() => typeof window === "undefined" ? "" : window.localStorage.getItem(tokenKey) || "");
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<PanelTab>("consultations");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);
  const [marqueeText, setMarqueeText] = useState("");
  const [savingMarquee, setSavingMarquee] = useState(false);
  const [marqueeStatus, setMarqueeStatus] = useState("");
  const [currentPageConsultations, setCurrentPageConsultations] = useState(1);
  const [currentPageContacts, setCurrentPageContacts] = useState(1);
  const [patientsPerSlot, setPatientsPerSlot] = useState("5");
  const [slotGapMinutes, setSlotGapMinutes] = useState("30");
  const [savingBookingSettings, setSavingBookingSettings] = useState(false);
  const [bookingSettingsStatus, setBookingSettingsStatus] = useState("");

  const [morningEnabled, setMorningEnabled] = useState(true);
  const [morningStart, setMorningStart] = useState("10:00");
  const [morningEnd, setMorningEnd] = useState("12:00");
  const [eveningEnabled, setEveningEnabled] = useState(true);
  const [eveningStart, setEveningStart] = useState("18:00");
  const [eveningEnd, setEveningEnd] = useState("20:00");
  const [savingTimingSettings, setSavingTimingSettings] = useState(false);
  const [timingSettingsStatus, setTimingSettingsStatus] = useState("");

  const isLoggedIn = Boolean(token && doctor);

  const clearSession = useCallback(() => {
    window.localStorage.removeItem(tokenKey);
    setToken("");
    setDoctor(null);
    setContacts([]);
    setConsultations([]);
    setVisitorCount(null);
    setSelectedConsultationId(null);
  }, []);

  const loadPanel = useCallback(async (activeToken = token) => {
    if (!activeToken) return;

    setLoading(true);
    setStatus("");
    try {
      const [
        profileData,
        contactData,
        consultationData,
        visitorData,
        marqueeData,
        patientsSetting,
        gapSetting,
        mStartSetting,
        mEndSetting,
        mEnabledSetting,
        eStartSetting,
        eEndSetting,
        eEnabledSetting
      ] = await Promise.all([
        api.getDoctorProfile(activeToken),
        api.listDoctorContacts(activeToken),
        api.listDoctorConsultations(activeToken),
        api.getVisitors(),
        fetch(`${API_BASE_URL}/settings/marquee_info`).then((res) => res.ok ? res.json() : { value: "" }).catch(() => ({ value: "" })),
        fetch(`${API_BASE_URL}/settings/patients_per_slot`).then((res) => res.ok ? res.json() : { value: "5" }).catch(() => ({ value: "5" })),
        fetch(`${API_BASE_URL}/settings/slot_gap_minutes`).then((res) => res.ok ? res.json() : { value: "30" }).catch(() => ({ value: "30" })),
        fetch(`${API_BASE_URL}/settings/morning_start`).then((res) => res.ok ? res.json() : { value: "10:00" }).catch(() => ({ value: "10:00" })),
        fetch(`${API_BASE_URL}/settings/morning_end`).then((res) => res.ok ? res.json() : { value: "12:00" }).catch(() => ({ value: "12:00" })),
        fetch(`${API_BASE_URL}/settings/morning_enabled`).then((res) => res.ok ? res.json() : { value: "true" }).catch(() => ({ value: "true" })),
        fetch(`${API_BASE_URL}/settings/evening_start`).then((res) => res.ok ? res.json() : { value: "18:00" }).catch(() => ({ value: "18:00" })),
        fetch(`${API_BASE_URL}/settings/evening_end`).then((res) => res.ok ? res.json() : { value: "20:00" }).catch(() => ({ value: "20:00" })),
        fetch(`${API_BASE_URL}/settings/evening_enabled`).then((res) => res.ok ? res.json() : { value: "true" }).catch(() => ({ value: "true" })),
      ]);
      setDoctor(profileData.doctor);
      setContacts(contactData.contacts);
      setConsultations(consultationData.consultations);
      setVisitorCount(visitorData.visitor_count);
      setMarqueeText(marqueeData.value || "");
      setPatientsPerSlot(patientsSetting.value || "5");
      setSlotGapMinutes(gapSetting.value || "30");
      setMorningStart(mStartSetting.value || "10:00");
      setMorningEnd(mEndSetting.value || "12:00");
      setMorningEnabled(mEnabledSetting.value !== "false");
      setEveningStart(eStartSetting.value || "18:00");
      setEveningEnd(eEndSetting.value || "20:00");
      setEveningEnabled(eEnabledSetting.value !== "false");
      setCurrentPageConsultations(1);
      setCurrentPageContacts(1);
    } catch (error) {
      setStatus(getErrorMessage(error));
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession, token]);

  async function handleSaveMarquee() {
    setSavingMarquee(true);
    setMarqueeStatus("");
    try {
      const res = await fetch(`${API_BASE_URL}/settings/marquee_info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value: marqueeText }),
      });
      if (!res.ok) {
        throw new Error("Failed to save announcement");
      }
      setMarqueeStatus("Success: Announcement updated!");
      setTimeout(() => setMarqueeStatus(""), 3000);
    } catch (err: any) {
      setMarqueeStatus(err.message || "Failed to update announcement");
    } finally {
      setSavingMarquee(false);
    }
  }

  async function handleRemoveMarquee() {
    setSavingMarquee(true);
    setMarqueeStatus("");
    try {
      const res = await fetch(`${API_BASE_URL}/settings/marquee_info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value: "" }),
      });
      if (!res.ok) {
        throw new Error("Failed to clear announcement");
      }
      setMarqueeText("");
      setMarqueeStatus("Success: Announcement removed!");
      setTimeout(() => setMarqueeStatus(""), 3000);
    } catch (err: any) {
      setMarqueeStatus(err.message || "Failed to clear announcement");
    } finally {
      setSavingMarquee(false);
    }
  }

  async function handleSaveBookingSettings() {
    setSavingBookingSettings(true);
    setBookingSettingsStatus("");
    try {
      const [resPatients, resGap] = await Promise.all([
        fetch(`${API_BASE_URL}/settings/patients_per_slot`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ value: patientsPerSlot }),
        }),
        fetch(`${API_BASE_URL}/settings/slot_gap_minutes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ value: slotGapMinutes }),
        }),
      ]);

      if (!resPatients.ok || !resGap.ok) {
        throw new Error("Failed to save booking settings");
      }

      setBookingSettingsStatus("Success: Booking settings updated!");
      setTimeout(() => setBookingSettingsStatus(""), 3000);
    } catch (err: any) {
      setBookingSettingsStatus(err.message || "Failed to update booking settings");
    } finally {
      setSavingBookingSettings(false);
    }
  }

  async function handleSaveTimingSettings() {
    setSavingTimingSettings(true);
    setTimingSettingsStatus("");

    if (morningEnabled && morningStart >= morningEnd) {
      setTimingSettingsStatus("Error: Morning start time must be before end time");
      setSavingTimingSettings(false);
      return;
    }
    if (eveningEnabled && eveningStart >= eveningEnd) {
      setTimingSettingsStatus("Error: Evening start time must be before end time");
      setSavingTimingSettings(false);
      return;
    }

    try {
      const [resMStart, resMEnd, resMEnabled, resEStart, resEEnd, resEEnabled] = await Promise.all([
        fetch(`${API_BASE_URL}/settings/morning_start`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ value: morningStart }),
        }),
        fetch(`${API_BASE_URL}/settings/morning_end`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ value: morningEnd }),
        }),
        fetch(`${API_BASE_URL}/settings/morning_enabled`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ value: String(morningEnabled) }),
        }),
        fetch(`${API_BASE_URL}/settings/evening_start`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ value: eveningStart }),
        }),
        fetch(`${API_BASE_URL}/settings/evening_end`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ value: eveningEnd }),
        }),
        fetch(`${API_BASE_URL}/settings/evening_enabled`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ value: String(eveningEnabled) }),
        }),
      ]);

      if (!resMStart.ok || !resMEnd.ok || !resMEnabled.ok || !resEStart.ok || !resEEnd.ok || !resEEnabled.ok) {
        throw new Error("Failed to save consultation timing settings");
      }

      setTimingSettingsStatus("Success: Consultation timing settings updated!");
      setTimeout(() => setTimingSettingsStatus(""), 3000);
    } catch (err: any) {
      setTimingSettingsStatus(err.message || "Failed to update consultation timing settings");
    } finally {
      setSavingTimingSettings(false);
    }
  }

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

  async function handleCompleteDirect(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await api.completeConsultation(id, token);
      await loadPanel(token);
    } catch (error) {
      alert(getErrorMessage(error));
    }
  }

  const consultationsPerPage = 30;
  const contactsPerPage = 30;

  const paginatedConsultations = useMemo(() => {
    return consultations.slice((currentPageConsultations - 1) * consultationsPerPage, currentPageConsultations * consultationsPerPage);
  }, [consultations, currentPageConsultations]);

  const paginatedContacts = useMemo(() => {
    return contacts.slice((currentPageContacts - 1) * contactsPerPage, currentPageContacts * contactsPerPage);
  }, [contacts, currentPageContacts]);

  const totalConsultationPages = Math.ceil(consultations.length / consultationsPerPage) || 1;
  const totalContactPages = Math.ceil(contacts.length / contactsPerPage) || 1;

  const currentRows = useMemo(() => {
    if (activeTab === "contacts") return paginatedContacts.length;
    return paginatedConsultations.length;
  }, [activeTab, paginatedConsultations.length, paginatedContacts.length]);

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

  if (selectedConsultationId) {
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
            <div>
              <Button type="button" variant="outline" onClick={() => { setSelectedConsultationId(null); void loadPanel(); }} className="h-11 rounded-lg shadow-sm border-slate-300 text-sm font-bold gap-2">
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <ConsultationDetailView
            id={selectedConsultationId}
            token={token}
            onBack={() => { setSelectedConsultationId(null); void loadPanel(); }}
            onCompleteSuccess={() => void loadPanel()}
          />
        </div>
      </section>
    );
  }

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
        <div className="mb-8 grid gap-4 grid-cols-1 md:grid-cols-3">
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
          <button type="button" onClick={() => setActiveTab("contacts")} className={tabClass(activeTab === "contacts")}>
            <MessageSquareText className="h-4 w-4" /> Contact Messages
          </button>
          <button type="button" onClick={() => setActiveTab("settings")} className={tabClass(activeTab === "settings")}>
            <Settings className="h-4 w-4" /> Settings
          </button>
        </div>

        {status ? <p className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm font-semibold text-red-700">{status}</p> : null}
        
        {activeTab !== "settings" && (
          <div className="mb-4 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {loading ? "Refreshing records..." : `Showing ${currentRows} of ${activeTab === "contacts" ? contacts.length : consultations.length} records`}
            </div>
          </div>
        )}

        {/* Data Tables */}
        <div className="transition-all duration-300">
          {activeTab === "consultations" ? (
            <>
              <ConsultationsTable 
                consultations={paginatedConsultations} 
                onSelect={setSelectedConsultationId}
                onComplete={handleCompleteDirect}
              />
              {totalConsultationPages > 1 && (
                <div className="mt-6 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-6 py-4 shadow-sm">
                  <div className="text-base font-bold text-slate-600">
                    Page {currentPageConsultations} of {totalConsultationPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageConsultations((p) => Math.max(p - 1, 1))}
                      disabled={currentPageConsultations === 1}
                      className="font-bold cursor-pointer h-10 px-4 text-base"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageConsultations((p) => Math.min(p + 1, totalConsultationPages))}
                      disabled={currentPageConsultations === totalConsultationPages}
                      className="font-bold cursor-pointer h-10 px-4 text-base"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : null}
          {activeTab === "contacts" ? (
            <>
              <ContactsTable contacts={paginatedContacts} />
              {totalContactPages > 1 && (
                <div className="mt-6 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-6 py-4 shadow-sm">
                  <div className="text-base font-bold text-slate-600">
                    Page {currentPageContacts} of {totalContactPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageContacts((p) => Math.max(p - 1, 1))}
                      disabled={currentPageContacts === 1}
                      className="font-bold cursor-pointer h-10 px-4 text-base"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageContacts((p) => Math.min(p + 1, totalContactPages))}
                      disabled={currentPageContacts === totalContactPages}
                      className="font-bold cursor-pointer h-10 px-4 text-base"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : null}
          {activeTab === "settings" ? (
            <div className="space-y-8 animate-fadeIn">
              {/* Announcement / Marquee Settings */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-black text-slate-900 tracking-tight mb-1 flex items-center gap-2">
                  <span>📢</span> Announcement Banner (Marquee)
                </h2>
                <p className="text-xs text-slate-500 font-semibold mb-4">
                  Add information (e.g., doctor unavailability) to display as a marquee banner on the home page. Leave blank to hide the banner.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    value={marqueeText}
                    onChange={(e) => setMarqueeText(e.target.value)}
                    placeholder="e.g. The doctor will not be available on 26 June 2026"
                    className="flex-1 h-11 border-slate-300"
                  />
                  <Button
                    onClick={handleSaveMarquee}
                    disabled={savingMarquee}
                    className="h-11 bg-cyan-700 hover:bg-cyan-800 text-white font-bold px-6 shadow cursor-pointer"
                  >
                    {savingMarquee ? "Saving..." : "Update Announcement"}
                  </Button>
                  {marqueeText && (
                    <Button
                      variant="outline"
                      onClick={handleRemoveMarquee}
                      disabled={savingMarquee}
                      className="h-11 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold px-6 cursor-pointer"
                    >
                      Clear / Remove
                    </Button>
                  )}
                </div>
                {marqueeStatus && (
                  <p className={`mt-2 text-xs font-bold ${marqueeStatus.startsWith("Success") ? "text-emerald-600" : "text-red-600"}`}>
                    {marqueeStatus}
                  </p>
                )}
              </div>

              {/* Booking & Slot Settings */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-black text-slate-900 tracking-tight mb-1 flex items-center gap-2">
                  <span>📅</span> Booking & Slot Settings
                </h2>
                <p className="text-xs text-slate-500 font-semibold mb-4">
                  Configure the maximum number of patients allowed per slot and the duration gap between slots.
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-end">
                  <label className="block">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Patients per Slot</span>
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={patientsPerSlot}
                      onChange={(e) => setPatientsPerSlot(e.target.value)}
                      placeholder="e.g. 5"
                      className="mt-2 h-11 border-slate-300"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Slot Gap (Minutes)</span>
                    <select
                      value={slotGapMinutes}
                      onChange={(e) => setSlotGapMinutes(e.target.value)}
                      className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                    >
                      <option value="10">10 Minutes</option>
                      <option value="15">15 Minutes</option>
                      <option value="20">20 Minutes</option>
                      <option value="30">30 Minutes (Default)</option>
                      <option value="45">45 Minutes</option>
                      <option value="60">60 Minutes (1 Hour)</option>
                    </select>
                  </label>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveBookingSettings}
                      disabled={savingBookingSettings}
                      className="h-11 bg-cyan-700 hover:bg-cyan-800 text-white font-bold px-6 shadow cursor-pointer w-full sm:w-auto"
                    >
                      {savingBookingSettings ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </div>
                {bookingSettingsStatus && (
                  <p className={`mt-2 text-xs font-bold ${bookingSettingsStatus.startsWith("Success") ? "text-emerald-600" : "text-red-600"}`}>
                    {bookingSettingsStatus}
                  </p>
                )}
              </div>

              {/* Consultation Timing Settings */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-black text-slate-900 tracking-tight mb-1 flex items-center gap-2">
                  <span>⏰</span> Consultation Timings Settings
                </h2>
                <p className="text-xs text-slate-500 font-semibold mb-4">
                  Configure the start/end times and enable/disable the morning and evening consultation sessions.
                </p>
                
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Morning Session */}
                  <div className="rounded-lg border border-slate-150 bg-slate-50/50 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800">Morning Session</span>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={morningEnabled}
                          onChange={(e) => setMorningEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-700"></div>
                        <span className="ml-2 text-xs font-bold text-slate-600">{morningEnabled ? "Enabled" : "Disabled"}</span>
                      </label>
                    </div>
                    
                    <div className="grid gap-4 grid-cols-2">
                      <label className="block">
                        <span className="text-xs font-semibold text-slate-500">Start Time</span>
                        <input
                          type="time"
                          value={morningStart}
                          onChange={(e) => setMorningStart(e.target.value)}
                          disabled={!morningEnabled}
                          className="mt-1 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-semibold text-slate-500">End Time</span>
                        <input
                          type="time"
                          value={morningEnd}
                          onChange={(e) => setMorningEnd(e.target.value)}
                          disabled={!morningEnabled}
                          className="mt-1 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Evening Session */}
                  <div className="rounded-lg border border-slate-150 bg-slate-50/50 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800">Evening Session</span>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={eveningEnabled}
                          onChange={(e) => setEveningEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-700"></div>
                        <span className="ml-2 text-xs font-bold text-slate-600">{eveningEnabled ? "Enabled" : "Disabled"}</span>
                      </label>
                    </div>
                    
                    <div className="grid gap-4 grid-cols-2">
                      <label className="block">
                        <span className="text-xs font-semibold text-slate-500">Start Time</span>
                        <input
                          type="time"
                          value={eveningStart}
                          onChange={(e) => setEveningStart(e.target.value)}
                          disabled={!eveningEnabled}
                          className="mt-1 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-semibold text-slate-500">End Time</span>
                        <input
                          type="time"
                          value={eveningEnd}
                          onChange={(e) => setEveningEnd(e.target.value)}
                          disabled={!eveningEnabled}
                          className="mt-1 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleSaveTimingSettings}
                    disabled={savingTimingSettings}
                    className="h-11 bg-cyan-700 hover:bg-cyan-800 text-white font-bold px-6 shadow cursor-pointer"
                  >
                    {savingTimingSettings ? "Saving..." : "Save Timing Settings"}
                  </Button>
                </div>

                {timingSettingsStatus && (
                  <p className={`mt-2 text-xs font-bold ${timingSettingsStatus.startsWith("Success") ? "text-emerald-600" : "text-red-600"}`}>
                    {timingSettingsStatus}
                  </p>
                )}
              </div>
            </div>
          ) : null}
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
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-slate-500 uppercase text-xs tracking-wider font-semibold border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 font-semibold">Date</th>
            <th className="px-6 py-4 font-semibold">Name</th>
            <th className="px-6 py-4 font-semibold">Contact Details</th>
            <th className="px-6 py-4 font-semibold">Message</th>
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
                <td className="whitespace-nowrap px-6 py-4 text-slate-500">{formatDate(contact.created_at)}</td>
                <td className="px-6 py-4 font-semibold text-slate-900">{contact.name}</td>
                <td className="px-6 py-4 text-slate-700">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-semibold text-slate-900">{contact.phone}</span>
                    <a href={waUrl} target="_blank" rel="noreferrer" title="Chat on WhatsApp" className="inline-flex items-center gap-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white px-2 py-0.5 text-xs font-semibold transition-all shadow-sm border border-emerald-200/50">
                      <Phone className="h-3 w-3" /> Chat
                    </a>
                  </div>
                  <p className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium"><Mail className="h-3.5 w-3.5" /> {contact.email || "Email not provided"}</p>
                </td>
                <td className="max-w-xl px-6 py-4 leading-relaxed text-slate-600">{contact.message}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ConsultationsTable({
  consultations,
  onSelect,
  onComplete,
}: {
  consultations: any[];
  onSelect: (id: string) => void;
  onComplete: (id: string, e: React.MouseEvent) => void;
}) {
  if (!consultations.length) return <EmptyState text="No consultation requests yet." />;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-slate-500 uppercase text-xs tracking-wider font-semibold border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 font-semibold">Patient Details</th>
            <th className="px-6 py-4 font-semibold">Preferred Date & Time</th>
            <th className="px-6 py-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {consultations.map((consultation) => {
            const isDone = consultation.is_completed;
            return (
              <tr 
                key={consultation.id} 
                onClick={() => onSelect(consultation.id)}
                className={`align-top hover:bg-slate-50/50 transition-colors cursor-pointer ${
                  isDone ? "bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-950" : ""
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-900">{consultation.name}</p>
                    {consultation.is_reconsultation && (
                      <span className="inline-flex items-center rounded-full bg-purple-50 border border-purple-200 px-2 py-0.5 text-xs font-semibold text-purple-700 shadow-sm">
                        Reconsultation
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{consultation.age} years, {consultation.gender}</p>
                  {consultation.submission_id && (
                    <p className="text-xs text-cyan-700 font-mono font-medium mt-1.5 bg-cyan-50/50 border border-cyan-100 px-2 py-0.5 rounded w-fit">
                      ID: {consultation.submission_id}
                    </p>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-900">
                  <p>{consultation.preferred_date ? formatDate(consultation.preferred_date).split("at")[0] : "N/A"}</p>
                  {consultation.preferred_time && (
                    <p className="text-xs text-slate-600 font-medium mt-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded w-fit">
                      {consultation.preferred_time}
                    </p>
                  )}
                </td>

                <td className="px-6 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onSelect(consultation.id)}
                      className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 border border-cyan-200 bg-cyan-50 px-3 py-1.5 rounded-lg shadow-sm hover:bg-cyan-100 transition cursor-pointer"
                    >
                      View Details
                    </button>
                    {!isDone ? (
                      <button
                        onClick={(e) => onComplete(consultation.id, e)}
                        className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg shadow-sm transition cursor-pointer"
                      >
                        Done
                      </button>
                    ) : (
                      <span className="text-emerald-800 text-xs font-semibold bg-emerald-50 px-2.5 py-1.5 border border-emerald-250 rounded-lg shadow-inner">
                        Completed
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ConsultationDetailView({
  id,
  token,
  onBack,
  onCompleteSuccess,
}: {
  id: string;
  token: string;
  onBack: () => void;
  onCompleteSuccess: () => void;
}) {
  const [data, setData] = useState<{ consultation: ConsultationRequest; history: ConsultationRequest[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getConsultationDetails(id, token);
      setData(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    void fetchDetails();
  }, [fetchDetails]);

  async function handleComplete() {
    setActionLoading(true);
    try {
      await api.completeConsultation(id, token);
      onCompleteSuccess();
      if (data) {
        setData({
          ...data,
          consultation: {
            ...data.consultation,
            is_completed: true,
          },
        });
      }
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-xl shadow-sm">
        <RefreshCw className="h-8 w-8 text-cyan-700 animate-spin mb-4" />
        <p className="text-slate-500 font-semibold">Loading consultation details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center">
        <p className="text-red-600 font-bold mb-4">{error || "Failed to load details"}</p>
        <Button onClick={onBack}>Back to Consultations</Button>
      </div>
    );
  }

  const { consultation, history } = data;
  const isCompleted = consultation.is_completed;
  
  const documents = consultation.document_urls?.length ? consultation.document_urls : consultation.document_url ? [consultation.document_url] : [];
  const rawPhone = consultation.phone || "";
  const formattedPhone = rawPhone.replace(/\D/g, "");
  const waNumber = formattedPhone.startsWith("91") ? formattedPhone : `91${formattedPhone}`;
  const waUrl = `https://wa.me/${waNumber}`;
  return (
    <div className="space-y-6 text-sm">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-xs font-semibold text-slate-500 hover:text-cyan-700 flex items-center gap-1.5 transition">
          ← Back to Consultations
        </button>
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-300 px-3 py-1 text-xs font-semibold text-emerald-800">
              ✓ Done / Completed
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-800">
              Pending
            </span>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 border-b border-slate-100 pb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{consultation.name}</h2>
            <p className="text-sm text-slate-500 mt-1">
              {consultation.age} years, {consultation.gender}
            </p>
          </div>
          {!isCompleted && (
            <Button onClick={handleComplete} disabled={actionLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-9 px-4 shadow-sm text-xs transition">
              {actionLoading ? "Processing..." : "Mark as Completed / Done"}
            </Button>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Preferred Appointment</h3>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">
                {consultation.preferred_date ? formatDate(consultation.preferred_date).split("at")[0] : "N/A"}
              </p>
              {consultation.preferred_time && (
                <p className="text-xs font-medium text-cyan-700 bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded w-fit mt-1">
                  {consultation.preferred_time}
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Contact Details</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">{consultation.phone}</span>
                <a href={waUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white px-2 py-0.5 text-xs font-semibold transition border border-emerald-200/50 shadow-sm">
                  <Phone className="h-3 w-3" /> WhatsApp
                </a>
              </div>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5"><Mail className="h-4 w-4 text-slate-400" /> {consultation.email || "Email not provided"}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Address</h3>
            <p className="text-sm text-slate-900 font-medium">{consultation.address}</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 grid gap-6 sm:grid-cols-2 text-sm">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Payment Details</h3>
            <div className="space-y-2">
              <p className="text-sm text-slate-500 font-medium">
                Category: <span className="text-slate-900 font-semibold">{paymentLabels[consultation.payment_category || ""] || consultation.payment_category || "N/A"}</span>
              </p>
              {consultation.is_reconsultation ? (
                <p className="text-sm text-slate-500 font-medium">
                  Fee Paid: <span className="text-purple-700 font-semibold">Free (Reconsultation)</span>
                </p>
              ) : (
                consultation.consultation_fee !== null && (
                  <p className="text-sm text-slate-500 font-medium">
                    Fee Paid: <span className="text-emerald-700 font-semibold">Rs. {consultation.consultation_fee}</span>
                  </p>
                )
              )}
              {consultation.submission_id && (
                <p className="text-sm text-slate-500 font-medium">
                  Submission ID: <span className="font-mono text-xs text-cyan-700 font-medium bg-cyan-50/50 border border-cyan-150 px-2 py-0.5 rounded shadow-sm">{consultation.submission_id}</span>
                </p>
              )}
              {consultation.razorpay_payment_id && (
                <p className="text-xs font-mono text-slate-400">Transaction ID: {consultation.razorpay_payment_id}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Verification Proofs</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Category Verification ID</p>
                {consultation.id_document_url ? (
                  <a className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-100 border border-cyan-200/50 shadow-sm transition cursor-pointer" href={consultation.id_document_url} target="_blank" rel="noreferrer">
                    View Uploaded ID Card
                  </a>
                ) : (
                  <span className="text-slate-400 text-sm font-medium">N/A</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Uploaded Medical Reports</h3>
          {documents.length ? (
            <div className="flex flex-wrap gap-2.5">
              {documents.map((document, index) => (
                <a key={document} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 text-xs font-bold tracking-tight transition border border-slate-200 shadow-sm" href={document} target="_blank" rel="noreferrer">
                  <FileText className="h-4 w-4 text-slate-500" /> Report / Document {index + 1}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm font-semibold">No medical reports uploaded.</p>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Patient Previous Records</h3>
        <p className="text-xs text-slate-500 font-medium mb-2">Automatically matched by name and phone number in previous consultations.</p>
        
        {!history.length ? (
          <p className="text-slate-500 text-sm font-semibold py-4 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-lg">No previous consultation records found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Reports</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {history.map((record) => {
                  const recordDocs = record.document_urls?.length ? record.document_urls : record.document_url ? [record.document_url] : [];
                  return (
                    <tr key={record.id} className="hover:bg-slate-50/50 align-top">
                      <td className="px-4 py-3 text-slate-550 whitespace-nowrap">{formatDate(record.created_at)}</td>
                      <td className="px-4 py-3">
                        {recordDocs.length ? (
                          <div className="flex flex-col gap-1">
                            {recordDocs.map((doc, idx) => (
                              <a key={doc} href={doc} target="_blank" rel="noreferrer" className="text-xs text-cyan-700 underline font-semibold hover:text-cyan-800">
                                Doc {idx + 1}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs font-semibold">No docs</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {record.is_completed ? (
                          <span className="text-emerald-700 text-xs font-semibold bg-emerald-50 px-2 py-0.5 border border-emerald-200 rounded">Done</span>
                        ) : (
                          <span className="text-amber-700 text-xs font-semibold bg-amber-50 px-2 py-0.5 border border-amber-200 rounded">Pending</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
