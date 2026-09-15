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

/**
 * Le due colonne del desktop.
 *
 * `split` sceglie le proporzioni che il design dà alla schermata: `hero` per
 * la Home (1.6fr / 1fr), `balanced` per i Conti (1.5fr / 1fr), `filters` per i
 * Movimenti (la lista, e 296px fissi di pannello filtri).
 *
 * Sotto i 1180px il contenitore e le colonne sono `display: contents`: i loro
 * figli si appiattiscono nella colonna singola di `PageContent` esattamente
 * come se questi wrapper non ci fossero. È per questo che il mobile non si
 * accorge di niente — non è un secondo layout, è lo stesso DOM che sopra la
 * soglia si dispone in griglia.
 */
export function PageColumns({
  children,
  split = "hero",
  className,
}: SlotProps & { split?: "hero" | "balanced" | "filters" }) {
  return (
    <div className={`page__columns page__columns--${split} ${className ?? ""}`}>
      {children}
    </div>
  );
}

export function PageColumn({ children, className }: SlotProps) {
  return <div className={`page__col ${className ?? ""}`}>{children}</div>;
}
