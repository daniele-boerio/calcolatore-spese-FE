import { ReactNode } from "react";
import "./stat_trio.scss";

export type Stat = {
  label: string;
  value: ReactNode;
  tone?: "neutral" | "positive" | "negative";
};

/**
 * Tre metriche in una card, separate da linee verticali: il riepilogo secondario
 * che sta sotto l'hero della Home.
 */
export default function StatTrio({
  stats,
  className,
}: {
  stats: Stat[];
  className?: string;
}) {
  return (
    <div className={`stat-trio ${className ?? ""}`}>
      {stats.map((stat) => (
        <div key={stat.label} className="stat-trio__cell">
          <span className="stat-trio__label">{stat.label}</span>
          <span
            className={`stat-trio__value stat-trio__value--${
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
