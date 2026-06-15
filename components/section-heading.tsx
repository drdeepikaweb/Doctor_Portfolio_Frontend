import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
};

export function SectionHeading({ eyebrow, title, description, centered }: Props) {
  return (
    <div className={cn("max-w-3xl", centered && "mx-auto text-center")}>
      {eyebrow ? <p className="text-sm font-bold uppercase tracking-widest text-teal-600">{eyebrow}</p> : null}
      <h2 className="mt-3 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-slate-600">{description}</p> : null}
    </div>
  );
}
