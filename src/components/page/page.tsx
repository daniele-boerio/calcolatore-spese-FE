import { ReactNode, useRef } from "react";
import { useScrollRestoration } from "../../features/ui/use_scroll_restoration";

type SlotProps = {
  children: ReactNode;
  className?: string;
};

/** Colonna della schermata: header fermo, contenuto che scorre, tab bar sotto. */
export function Page({ children, className }: SlotProps) {
  return <div className={`page ${className ?? ""}`}>{children}</div>;
}

export function PageHeader({ children, className }: SlotProps) {
  return (
    <header className={`page__header ${className ?? ""}`}>{children}</header>
  );
}

/**
 * Area scrollabile. È lei a tenere la posizione di scroll per percorso: passare
 * da un tab all'altro non deve far ripartire la lista dall'inizio.
 */
export function PageContent({ children, className }: SlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollRestoration(ref);

  return (
    <div ref={ref} className={`page__content ${className ?? ""}`}>
      {children}
    </div>
  );
}
