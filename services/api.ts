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
  createAppointment: (data: unknown) => request("/appointments", { method: "POST", body: JSON.stringify(data) }),
  createContact: (data: unknown) => request("/contact", { method: "POST", body: JSON.stringify(data) }),
  createConsultation: (data: FormData) => request("/consultations", { method: "POST", body: data }),
  getVisitors: () => request<{ visitor_count: number }>("/visitors", { cache: "no-store" }),
  incrementVisitors: () => request<{ visitor_count: number }>("/visitors/increment", { method: "POST", credentials: "include" }),
};

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
