import type { UseFormRegisterReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type FieldErrorLike = {
  message?: string;
};

type FieldProps = {
  label: string;
  error?: FieldErrorLike;
  registration: UseFormRegisterReturn;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function Field({ label, error, registration, ...props }: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <Input className="mt-2" aria-invalid={!!error} {...registration} {...props} />
      {error ? <span className="mt-1 block text-sm text-red-600">{error.message}</span> : null}
    </label>
  );
}

type TextAreaFieldProps = {
  label: string;
  error?: FieldErrorLike;
  registration: UseFormRegisterReturn;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextAreaField({ label, error, registration, ...props }: TextAreaFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <Textarea className="mt-2" aria-invalid={!!error} {...registration} {...props} />
      {error ? <span className="mt-1 block text-sm text-red-600">{error.message}</span> : null}
    </label>
  );
}
