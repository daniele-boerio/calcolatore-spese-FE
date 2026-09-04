import { ReactNode } from "react";
import "./stat_row.scss";

export type Stat = {
  label: string;
  value: ReactNode;
  tone?: "neutral" | "positive" | "negative";
};

/**
 * Poche metriche affiancate in una card, separate da linee verticali: il
 * riepilogo secondario che sta sotto l'hero della Home. Le colonne le detta la
 * lista, non il CSS.
 */
export default function StatRow({
  stats,
  className,
}: {
  stats: Stat[];
  className?: string;
}) {
  return (
    <div className={`stat-row ${className ?? ""}`}>
      {stats.map((stat) => (
        <div key={stat.label} className="stat-row__cell">
          <span className="stat-row__label">{stat.label}</span>
          <span
            className={`stat-row__value stat-row__value--${
              stat.tone ?? "neutral"
            }`}
          >
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
