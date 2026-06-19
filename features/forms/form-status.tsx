import { cn } from "@/lib/utils";

export type FormStatus = {
  type: "success" | "error" | "info";
  message: string;
};

export function FormStatusMessage({ status }: { status: FormStatus | null }) {
  if (!status) return null;

  return (
    <p
      className={cn(
        "rounded-md p-3 text-sm font-medium",
        status.type === "success" ? "bg-teal-50 text-teal-800" :
        status.type === "info" ? "bg-cyan-50 text-cyan-800" :
        "bg-red-50 text-red-700",
      )}
      role={status.type === "error" ? "alert" : "status"}
    >
      {status.message}
    </p>
  );
}
